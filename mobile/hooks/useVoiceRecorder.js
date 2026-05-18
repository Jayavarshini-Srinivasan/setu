import { useState, useRef, useCallback } from "react";
import { Alert } from "react-native";
import { Audio } from "expo-av";
import { API_BASE_URL } from "@env";



export const VOICE_STATE = {
  IDLE:       "idle",
  RECORDING:  "recording",
  RECORDED:   "recorded",
  PROCESSING: "processing",
  CONFIRMED:  "confirmed",
};


export default function useVoiceRecorder({ onResult }) {

  const [voiceState,       setVoiceState]       = useState(VOICE_STATE.IDLE);
  const [transcript,       setTranscript]        = useState("");
  const [extractedProfile, setExtractedProfile]  = useState(null);

  const recordingRef = useRef(null);
  const audioUriRef  = useRef(null);
  const soundRef     = useRef(null);

  const startRecording = useCallback(async () => {

    if (voiceState !== VOICE_STATE.IDLE) return;
    if (recordingRef.current)            return;

    try {

      const perm = await Audio.requestPermissionsAsync();
      if (perm.status !== "granted") {
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

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setVoiceState(VOICE_STATE.RECORDING);

    } catch (err) {
      console.error("[useVoiceRecorder] startRecording:", err);
      Alert.alert("Error", "Could not start recording.");
    }

  }, [voiceState]);

  const stopRecording = useCallback(async () => {

    if (voiceState !== VOICE_STATE.RECORDING) return;
    if (!recordingRef.current)                return;

    try {

      await recordingRef.current.stopAndUnloadAsync();
      audioUriRef.current  = recordingRef.current.getURI();
      recordingRef.current = null;

       await Audio.setAudioModeAsync({
        allowsRecordingIOS:   false,
        playsInSilentModeIOS: true,
      });

      setVoiceState(VOICE_STATE.RECORDED);

    } catch (err) {
      console.error("[useVoiceRecorder] stopRecording:", err);
      recordingRef.current = null;
      setVoiceState(VOICE_STATE.IDLE);
      Alert.alert("Error", "Could not stop recording.");
    }

  }, [voiceState]);

  const playRecording = useCallback(async () => {

    if (voiceState !== VOICE_STATE.RECORDED) return;
    if (!audioUriRef.current)                return;

    try {

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUriRef.current },
        { shouldPlay: true }
      );

      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          soundRef.current = null;
        }
      });

    } catch (err) {
      console.error("[useVoiceRecorder] playRecording:", err);
      Alert.alert("Error", "Could not play recording.");
    }

  }, [voiceState]);

  const retakeRecording = useCallback(async () => {

    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => {});
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }

    audioUriRef.current  = null;
    recordingRef.current = null;

    setTranscript("");
    setExtractedProfile(null);
    setVoiceState(VOICE_STATE.IDLE);

  }, []);

  const submitRecording = useCallback(async () => {

    if (voiceState !== VOICE_STATE.RECORDED) return;
    if (!audioUriRef.current)                return;

    setVoiceState(VOICE_STATE.PROCESSING);

    try {

      const formData = new FormData();
      formData.append("audio", {
        uri:  audioUriRef.current,
        name: "voice-recording.m4a",
        type: "audio/m4a",
      });

      const response = await fetch(`${API_BASE_URL}/voice/upload-audio`, {
        method:  "POST",
        body:    formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }

      const newTranscript   = data.transcript       || "";
      const newExtracted    = data.extractedProfile  || {};

      setTranscript(newTranscript);
      setExtractedProfile(newExtracted);
      audioUriRef.current = null;

      setVoiceState(VOICE_STATE.CONFIRMED);

    } catch (err) {
      console.error("[useVoiceRecorder] submitRecording:", err);
      setVoiceState(VOICE_STATE.RECORDED);
      Alert.alert("Error", "Could not process your recording. Please try again.");
    }

  }, [voiceState]);

  const confirmExtraction = useCallback(() => {

    if (voiceState !== VOICE_STATE.CONFIRMED) return;

    onResult?.({
      transcript,
      extractedProfile,
    });

    setTranscript("");
    setExtractedProfile(null);
    setVoiceState(VOICE_STATE.IDLE);

  }, [voiceState, transcript, extractedProfile, onResult]);

  const rejectExtraction = useCallback(() => {

    setTranscript("");
    setExtractedProfile(null);
    setVoiceState(VOICE_STATE.IDLE);

  }, []);

  return {
    voiceState,
    transcript,
    extractedProfile,
    startRecording,
    stopRecording,
    playRecording,
    retakeRecording,
    submitRecording,
    confirmExtraction,
    rejectExtraction,
  };
}
