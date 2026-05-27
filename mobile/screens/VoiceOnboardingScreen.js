import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Audio } from "expo-av";
import { auth, db } from "../services/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { API_BASE_URL } from "../services/api";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";
import VoiceButton from "../components/VoiceButton";
import LoadingSpinner from "../components/LoadingSpinner";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import { useOnboarding } from "../context/OnboardingContext";

export default function VoiceOnboardingScreen({ navigation }) {
  const { updateField, onboardingData } = useOnboarding();

  const [status, setStatus] = useState("IDLE"); // IDLE, RECORDING, RECORDED, PROCESSING, RESULT
  const [recording, setRecording] = useState(null);
  const [recordingUri, setRecordingUri] = useState("");
  const [sound, setSound] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const timerRef = useRef(null);

  useEffect(() => {
    if (status === "RECORDING") {
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const startRecording = async () => {
    try {
      setStatus("RECORDING"); // Immediate feedback
      setRecordingDuration(0);

      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        alert("Microphone permission is required");
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (error) {
      console.log(error);
      alert("Failed to start recording");
      setStatus("IDLE");
    }
  };

  const stopRecording = async () => {
    try {
      setStatus("RECORDED"); // Immediate feedback
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null);
    } catch (error) {
      console.log(error);
      alert("Failed to stop recording");
      setStatus("IDLE");
    }
  };

  const playRecording = async () => {
    try {
      if (!recordingUri) return;
      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.log(error);
      alert("Failed to play recording");
    }
  };

  const resetRecording = () => {
    setRecordingUri("");
    setExtractedData(null);
    setStatus("IDLE");
    setRecordingDuration(0);
  };

  const uploadAudio = async () => {
    try {
      if (!recordingUri) return;
      setStatus("PROCESSING");
      
      const formData = new FormData();
      formData.append("audio", {
        uri: recordingUri,
        name: "voice-recording.m4a",
        type: "audio/m4a",
      });
      formData.append("context", JSON.stringify(onboardingData));

      const response = await fetch(`${API_BASE_URL}/voice/upload-audio`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();
      console.log("Extracted Data:", data);
      
      if (!data || !data.extractedProfile) {
        throw new Error("Invalid extraction response");
      }
      
      setExtractedData(data);
      setStatus("RESULT");

    } catch (error) {
      console.log(error);
      alert("Upload or processing failed. Please try again.");
      setStatus("RECORDED");
    }
  };

  const confirmProfile = async () => {
    try {
      if (!extractedData || !extractedData.extractedProfile) return;
      
      const profile = extractedData.extractedProfile;
      
      // Update local context
      updateField("canonicalRole", profile.canonicalRole || "");
      updateField("role", profile.rawRole || profile.canonicalRole || "");
      updateField("skills", profile.skills || []);
      updateField("experience", profile.experience || 0);
      updateField("location", profile.location || "");
      
      // Go to Review Screen to finalize
      if (navigation) {
        navigation.navigate("ReviewOnboarding");
      } else {
        alert("Profile loaded successfully.");
      }
    } catch (error) {
      console.log(error);
      alert("Failed to confirm profile");
    }
  };

  const renderContent = () => {
    if (status === "IDLE") {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.instructionText}>Hold to Speak</Text>
          <VoiceButton
            isRecording={false}
            onPressIn={startRecording}
            onPressOut={() => {}} // no-op; user hasn't started yet
          />
          <Text style={styles.hintText}>Press and hold the button while talking</Text>
        </View>
      );
    }

    if (status === "RECORDING") {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.instructionText}>Recording...</Text>
          <Text style={styles.timerText}>{formatTime(recordingDuration)}</Text>
          {/* Single persistent button — onPressOut stops recording */}
          <VoiceButton
            isRecording={true}
            onPressIn={() => {}} // already recording, no-op
            onPressOut={stopRecording}
          />
          <Text style={styles.hintText}>Release to stop recording</Text>
        </View>
      );
    }

    if (status === "RECORDED") {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.instructionText}>Recording Ready ✓</Text>
          <View style={styles.actionRow}>
            <SecondaryButton title="▶ Play" onPress={playRecording} style={styles.actionBtn} />
            <SecondaryButton title="↺ Re-record" onPress={resetRecording} style={styles.actionBtn} />
          </View>
          <PrimaryButton title="Upload & Analyze" onPress={uploadAudio} style={{marginTop: 20}} />
        </View>
      );
    }

    if (status === "PROCESSING") {
      return (
        <View style={styles.stateContainer}>
          <LoadingSpinner text="Analyzing your response..." />
        </View>
      );
    }

    if (status === "RESULT") {
      const profile = extractedData?.extractedProfile;
      if (!profile) return null;
      return (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Extracted Profile</Text>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Detected Role:</Text>
            <Text style={styles.resultValue}>
              {profile.canonicalRole !== "other" && profile.canonicalRole ? profile.canonicalRole : (profile.rawRole || "Not detected")}
            </Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Location:</Text>
            <Text style={styles.resultValue}>{profile.location || "Not detected"}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Skills:</Text>
            <Text style={styles.resultValue}>{(profile.skills && profile.skills.length > 0) ? profile.skills.join(", ") : "None detected"}</Text>
          </View>

          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Experience:</Text>
            <Text style={styles.resultValue}>{profile.experience || 0} years</Text>
          </View>

          <View style={styles.resultActions}>
            <SecondaryButton title="Retry" onPress={resetRecording} style={{flex: 1, marginRight: 10}} />
            <PrimaryButton title="Confirm" onPress={confirmProfile} style={{flex: 1}} />
          </View>
        </View>
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Voice Onboarding</Text>
      <Text style={styles.subheading}>
        Tell us about your work experience in your own language.
      </Text>
      <View style={styles.contentArea}>
        {renderContent()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: SPACING.xxl,
    marginBottom: SPACING.sm,
  },
  subheading: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: SPACING.xl,
  },
  contentArea: {
    flex: 1,
    justifyContent: "center",
  },
  stateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxl,
  },
  instructionText: {
    fontSize: 22,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  timerText: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: SPACING.xl,
  },
  hintText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: SPACING.md,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: SPACING.xl,
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  resultContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: "center",
  },
  resultRow: {
    marginBottom: SPACING.md,
  },
  resultLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: "500",
    color: COLORS.text,
  },
  resultActions: {
    flexDirection: "row",
    marginTop: SPACING.xl,
  },
});