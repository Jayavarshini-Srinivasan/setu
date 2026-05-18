import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import VoiceButton from "../components/VoiceButton";
import useVoiceRecorder, { VOICE_STATE } from "../hooks/useVoiceRecorder";
import { useOnboarding } from "../context/OnboardingContext";

const EXPERIENCE_OPTIONS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];

export default function ExperienceQuestionScreen({ navigation }) {

  const {
    onboardingData,
    updateField,
    addTranscript,
  } = useOnboarding();

  const [experience, setExperience] = useState(
    onboardingData.experience?.toString() || ""
  );

  /*
    VOICE RECORDER
  */
  const {
    voiceState,
    transcript,
    startRecording,
    stopRecording,
    playRecording,
    retakeRecording,
    submitRecording,
  } = useVoiceRecorder({
    onResult: ({ transcript: tx, extractedProfile }) => {
      if (tx) addTranscript(tx);

      const exp = extractedProfile?.experience;
      if (exp !== undefined && exp !== null) {
        setExperience(exp.toString());
        updateField("experience", Number(exp));
      }
    },
  });

  /*
    CONTINUE
  */
  const handleContinue = () => {
    if (!experience) {
      Alert.alert("Required", "Please enter your years of experience.");
      return;
    }
    updateField("experience", Number(experience));
    navigation.navigate("LocationQuestion");
  };

  /*
    INLINE VOICE SECTION
  */
  const renderVoice = () => {

    if (voiceState === VOICE_STATE.PROCESSING) {
      return (
        <View style={styles.voiceCenter}>
          <ActivityIndicator size="large" color="#E85D04" style={{ marginBottom: 10 }} />
          <Text style={styles.processingLabel}>Analysing your response…</Text>
        </View>
      );
    }

    if (voiceState === VOICE_STATE.RECORDED) {
      return (
        <View style={styles.voiceCenter}>
          <View style={styles.recordedBadge}>
            <Text style={styles.recordedBadgeText}>🎙️  Recording ready</Text>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.playBtn]} onPress={playRecording}>
              <Text style={styles.actionBtnText}>▶  Play</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.retakeBtn]} onPress={retakeRecording}>
              <Text style={styles.actionBtnText}>🔄  Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.submitBtn]} onPress={submitRecording}>
              <Text style={styles.actionBtnText}>✅  Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.voiceCenter}>
        <Text style={styles.holdLabel}>
          {voiceState === VOICE_STATE.RECORDING
            ? "🔴  Recording… release to stop"
            : "Hold to speak"}
        </Text>
        <VoiceButton
          isRecording={voiceState === VOICE_STATE.RECORDING}
          onPressIn={startRecording}
          onPressOut={stopRecording}
        />
        {voiceState === VOICE_STATE.IDLE && (
          <Text style={styles.hintText}>Press and hold the button while talking</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>

      {/* PROGRESS BAR */}
      <View style={styles.progressContainer}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressSegment,
              i + 1 <= 3 ? styles.progressActive : styles.progressInactive,
            ]}
          />
        ))}
      </View>

      <Text style={styles.title}>How many years of experience do you have?</Text>
      <Text style={styles.subtitle}>Type a number, tap a chip, or speak naturally.</Text>

      {/* TEXT INPUT */}
      <TextInput
        style={styles.input}
        placeholder="e.g. 3"
        keyboardType="numeric"
        value={experience}
        onChangeText={setExperience}
      />

      {/* QUICK CHIPS */}
      <View style={styles.chipsRow}>
        {EXPERIENCE_OPTIONS.map((opt) => {
          const isSelected = experience === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => {
                setExperience(opt);
                updateField("experience", Number(opt));
              }}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* VOICE */}
      {renderVoice()}

      {/* TRANSCRIPT */}
      {transcript ? (
        <View style={styles.transcriptBox}>
          <Text style={styles.transcriptLabel}>Transcript</Text>
          <Text style={styles.transcriptText}>{transcript}</Text>
        </View>
      ) : null}

      {/* CONTINUE */}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
    backgroundColor: "#FAF9F6",
  },

  progressContainer: { flexDirection: "row", gap: 8, marginBottom: 30 },
  progressSegment:  { flex: 1, height: 4, borderRadius: 2 },
  progressActive:   { backgroundColor: "#E85D04" },
  progressInactive: { backgroundColor: "#E5E7EB" },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 22,
  },

  input: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 16,
    fontSize: 22,
    marginBottom: 18,
    backgroundColor: "#fff",
    color: "#111827",
    textAlign: "center",
    fontWeight: "bold",
  },

  /* QUICK CHIPS */
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 22,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  chipSelected: {
    backgroundColor: "#FFF4ED",
    borderColor: "#E85D04",
  },
  chipText: { fontSize: 14, color: "#4B5563", fontWeight: "600" },
  chipTextSelected: { color: "#E85D04", fontWeight: "bold" },

  /* VOICE */
  voiceCenter: { alignItems: "center", marginBottom: 20 },
  holdLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  hintText: { color: "#9CA3AF", fontSize: 13, marginTop: 8 },
  processingLabel: { color: "#E85D04", fontWeight: "700", fontSize: 15 },
  recordedBadge: {
    backgroundColor: "#F0FDF4",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  recordedBadgeText: { color: "#15803D", fontWeight: "700", fontSize: 14 },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: { paddingVertical: 11, paddingHorizontal: 16, borderRadius: 12, alignItems: "center" },
  playBtn:   { backgroundColor: "#2563EB" },
  retakeBtn: { backgroundColor: "#6B7280" },
  submitBtn: { backgroundColor: "#16A34A" },
  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  /* TRANSCRIPT */
  transcriptBox: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  transcriptLabel: {
    fontWeight: "bold",
    color: "#9CA3AF",
    fontSize: 11,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  transcriptText: {
    fontSize: 15,
    color: "#1F2937",
    fontStyle: "italic",
  },

  /* CONTINUE */
  continueButton: {
    backgroundColor: "#E85D04",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#E85D04",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 4,
  },
  continueText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
});