import { useState, useRef, useCallback, useEffect } from "react";
import { Alert } from "react-native";
import { Audio } from "expo-av";
import { API_BASE_URL } from "../services/api";

let activeRecorderId = null;


export const VOICE_STATE = {
  IDLE:       "idle",
  RECORDING:  "recording",
  RECORDED:   "recorded",
  PROCESSING: "processing",
  CONFIRMED:  "confirmed",
  ERROR:      "error",
};


export default function useVoiceRecorder({ onResult, contextData, screenType }) {

  const [voiceState,       setVoiceState]       = useState(VOICE_STATE.IDLE);
  const [transcript,       setTranscript]        = useState("");
  const [extractedProfile, setExtractedProfile]  = useState(null);
  const [errorMessage,     setErrorMessage]      = useState("");
  const [isPlaying,        setIsPlaying]         = useState(false);

  const recordingRef = useRef(null);
  const audioUriRef  = useRef(null);
  const soundRef     = useRef(null);
  const recorderIdRef = useRef(`${Date.now()}-${Math.random()}`);
  const voiceStateRef = useRef(VOICE_STATE.IDLE);

  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  const cleanupSound = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => {});
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => () => {
    cleanupSound();
    if (recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync().catch((err) => {
        console.error("[useVoiceRecorder] cleanup stopAndUnloadAsync failed:", err?.message || err);
      });
      recordingRef.current = null;
    }
    if (activeRecorderId === recorderIdRef.current) {
      activeRecorderId = null;
    }
  }, [cleanupSound]);

  const startRecording = useCallback(async () => {

    if (voiceStateRef.current !== VOICE_STATE.IDLE && voiceStateRef.current !== VOICE_STATE.ERROR) return;
    if (recordingRef.current)            return;
    if (activeRecorderId && activeRecorderId !== recorderIdRef.current) {
      const message = "Another voice recording is already active. Stop it before starting a new one.";
      console.error("[useVoiceRecorder] startRecording blocked:", message);
      setErrorMessage(message);
      Alert.alert("Recording Active", message);
      return;
    }

    try {
      setErrorMessage("");
      await cleanupSound();

      const perm = await Audio.requestPermissionsAsync();
      if (perm.status !== "granted") {
        const message = "Microphone permission denied. Enable microphone access to use voice input.";
        console.error("[useVoiceRecorder] permission denied:", perm);
        setErrorMessage(message);
        Alert.alert(
          "Permission Required",
          "Microphone access is needed to use voice input."
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS:   true,
        playsInSilentModeIOS: true,
      });

      activeRecorderId = recorderIdRef.current;
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setVoiceState(VOICE_STATE.RECORDING);

    } catch (err) {
      activeRecorderId = null;
      const message = err?.message || "Recording could not be started.";
      console.error("[useVoiceRecorder] startRecording failed:", message, err);
      setErrorMessage(message);
      setVoiceState(VOICE_STATE.ERROR);
      Alert.alert("Error", "Could not start recording.");
    }

  }, [cleanupSound]);

  const stopRecording = useCallback(async () => {

    if (voiceStateRef.current !== VOICE_STATE.RECORDING) return;
    if (!recordingRef.current)                return;

    try {

      await recordingRef.current.stopAndUnloadAsync();
      audioUriRef.current  = recordingRef.current.getURI();
      recordingRef.current = null;
      activeRecorderId = null;

       await Audio.setAudioModeAsync({
        allowsRecordingIOS:   false,
        playsInSilentModeIOS: true,
      });

      setVoiceState(VOICE_STATE.RECORDED);

    } catch (err) {
      activeRecorderId = null;
      const message = err?.message || "Recording could not be stopped.";
      console.error("[useVoiceRecorder] stopRecording failed:", message, err);
      recordingRef.current = null;
      setErrorMessage(message);
      setVoiceState(VOICE_STATE.ERROR);
      Alert.alert("Error", "Could not stop recording.");
    }

  }, []);

  const playRecording = useCallback(async () => {

    if (![VOICE_STATE.RECORDED, VOICE_STATE.CONFIRMED].includes(voiceStateRef.current)) return;
    if (!audioUriRef.current)                return;

    try {
      await cleanupSound();

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUriRef.current },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          soundRef.current = null;
          setIsPlaying(false);
        }
      });

    } catch (err) {
      const message = err?.message || "Recording playback failed.";
      console.error("[useVoiceRecorder] playRecording failed:", message, err);
      setErrorMessage(message);
      Alert.alert("Error", "Could not play recording.");
    }

  }, [cleanupSound]);

  const retakeRecording = useCallback(async () => {

    await cleanupSound();

    audioUriRef.current  = null;
    recordingRef.current = null;
    if (activeRecorderId === recorderIdRef.current) {
      activeRecorderId = null;
    }

    setTranscript("");
    setExtractedProfile(null);
    setErrorMessage("");
    setVoiceState(VOICE_STATE.IDLE);

  }, [cleanupSound]);

  const submitRecording = useCallback(async () => {

    if (voiceStateRef.current !== VOICE_STATE.RECORDED) return;
    if (!audioUriRef.current)                return;

    setVoiceState(VOICE_STATE.PROCESSING);
    setExtractedProfile(null); // clear any stale extraction before new API call

    try {

      const formData = new FormData();
      formData.append("audio", {
        uri:  audioUriRef.current,
        name: "voice-recording.m4a",
        type: "audio/m4a",
      });
      if (screenType) {
        formData.append("screenType", screenType);
      } else if (contextData) {
        formData.append("context", JSON.stringify(contextData));
      }

      const response = await fetch(`${API_BASE_URL}/voice/upload-audio`, {
        method:  "POST",
        body:    formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const responseText = await response.text();
      let data = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("[useVoiceRecorder] submitRecording invalid JSON response:", responseText);
        throw new Error(`Invalid transcription response: ${parseError?.message || parseError}`);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Transcription request failed with status ${response.status}`);
      }

      const newTranscript   = data.transcript       || "";
      const newExtracted    = data.extractedProfile  || {};

      if (!newTranscript.trim()) {
        throw new Error("No speech was detected in the recording.");
      }

      setTranscript(newTranscript);
      setExtractedProfile(newExtracted);
      setErrorMessage("");

      setVoiceState(VOICE_STATE.CONFIRMED);

    } catch (err) {
      const message = err?.message || "Recording could not be transcribed.";
      console.error("[useVoiceRecorder] submitRecording failed:", message, err);
      setErrorMessage(message);
      setVoiceState(VOICE_STATE.RECORDED);
      Alert.alert("Error", "Could not process your recording. Please try again.");
    }

  }, [screenType, contextData]);

  const confirmExtraction = useCallback(() => {

    if (voiceStateRef.current !== VOICE_STATE.CONFIRMED) return;

    onResult?.({
      transcript: transcript.trim(),
      extractedProfile,
    });

    audioUriRef.current = null;
    setTranscript("");
    setExtractedProfile(null);
    setErrorMessage("");
    setVoiceState(VOICE_STATE.IDLE);

  }, [transcript, extractedProfile, onResult]);

  const rejectExtraction = useCallback(() => {
    retakeRecording();
  }, [retakeRecording]);

  return {
    voiceState,
    transcript,
    setTranscript,
    extractedProfile,
    errorMessage,
    isPlaying,
    startRecording,
    stopRecording,
    playRecording,
    retakeRecording,
    submitRecording,
    confirmExtraction,
    rejectExtraction,
  };
}
