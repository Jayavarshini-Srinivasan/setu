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
import { useI18n } from "../context/I18nContext";

const EXPERIENCE_OPTIONS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];

export default function ExperienceQuestionScreen({ navigation }) {

  const {
    onboardingData,
    updateField,
    addTranscript,
  } = useOnboarding();
  
  const { t } = useI18n();

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
          <ActivityIndicator size="large" color="#E85D26" style={{ marginBottom: 10 }} />
          <Text style={styles.processingLabel}>{t("analyzingResponse") || "Analysing your response…"}</Text>
        </View>
      );
    }

    if (voiceState === VOICE_STATE.RECORDED) {
      return (
        <View style={styles.voiceCenter}>
          <View style={styles.recordedBadge}>
            <Text style={styles.recordedBadgeText}>🎙️  {t("recordingReady") || "Recording ready"}</Text>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.playBtn]} onPress={playRecording}>
              <Text style={styles.actionBtnText}>▶  {t("play") || "Play"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.retakeBtn]} onPress={retakeRecording}>
              <Text style={styles.actionBtnText}>🔄  {t("retake") || "Retake"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.submitBtn]} onPress={submitRecording}>
              <Text style={styles.actionBtnText}>✅  {t("submit") || "Submit"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.voiceCenter}>
        <Text style={styles.holdLabel}>
          {voiceState === VOICE_STATE.RECORDING
            ? "🔴  " + (t("recordingReleaseToStop") || "Recording… release to stop")
            : t("holdToSpeak") || "Hold to speak"}
        </Text>
        <VoiceButton
          isRecording={voiceState === VOICE_STATE.RECORDING}
          onPressIn={startRecording}
          onPressOut={stopRecording}
        />
        {voiceState === VOICE_STATE.IDLE && (
          <Text style={styles.hintText}>{t("pressAndHoldHint") || "Press and hold the button while talking"}</Text>
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

      <Text style={styles.title}>{t("howManyYears") || "How many years of experience do you have?"}</Text>
      <Text style={styles.subtitle}>{t("experienceSubtitle") || "Type a number, tap a chip, or speak naturally."}</Text>

      {/* TEXT INPUT */}
      <TextInput
        style={styles.input}
        placeholder={t("experiencePlaceholder") || "e.g. 3"}
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
          <Text style={styles.transcriptLabel}>{t("transcript") || "Transcript"}</Text>
          <Text style={styles.transcriptText}>{transcript}</Text>
        </View>
      ) : null}

      {/* CONTINUE */}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>{t("continue") || "Continue"}</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
    backgroundColor: "#F7F5F2",
  },

  progressContainer: { flexDirection: "row", gap: 8, marginBottom: 30 },
  progressSegment:  { flex: 1, height: 4, borderRadius: 2 },
  progressActive:   { backgroundColor: "#E85D26" },
  progressInactive: { backgroundColor: "rgba(26,26,46,0.12)" },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A2E",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B6B80",
    marginBottom: 22,
  },

  input: {
    borderWidth: 1.5,
    borderColor: "rgba(26,26,46,0.12)",
    borderRadius: 14,
    padding: 16,
    fontSize: 22,
    marginBottom: 18,
    backgroundColor: "#fff",
    color: "#1A1A2E",
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
    borderColor: "rgba(26,26,46,0.12)",
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  chipSelected: {
    backgroundColor: "#FDF0EB",
    borderColor: "#E85D26",
  },
  chipText: { fontSize: 14, color: "#6B6B80", fontWeight: "600" },
  chipTextSelected: { color: "#E85D26", fontWeight: "bold" },

  /* VOICE */
  voiceCenter: { alignItems: "center", marginBottom: 20 },
  holdLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 12,
  },
  hintText: { color: "#6B6B80", fontSize: 13, marginTop: 8 },
  processingLabel: { color: "#E85D26", fontWeight: "700", fontSize: 15 },
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
  playBtn:   { backgroundColor: "#E85D26" },
  retakeBtn: { backgroundColor: "#6B6B80" },
  submitBtn: { backgroundColor: "#16A34A" },
  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  /* TRANSCRIPT */
  transcriptBox: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(26,26,46,0.12)",
  },
  transcriptLabel: {
    fontWeight: "bold",
    color: "#6B6B80",
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
    backgroundColor: "#E85D26",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    marginTop: 4,
  },
  continueText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
});