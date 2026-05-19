import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";

import VoiceButton from "../components/VoiceButton";
import useVoiceRecorder, { VOICE_STATE } from "../hooks/useVoiceRecorder";
import { useOnboarding } from "../context/OnboardingContext";
import { useI18n } from "../context/I18nContext";

const LOCATION_OPTIONS = [
  "Chennai",
  "Bangalore",
  "Hyderabad",
  "Mumbai",
  "Delhi",
  "Pune",
  "Coimbatore",
  "Noida",
];

export default function LocationQuestionScreen({ navigation }) {

  const {
    onboardingData,
    updateField,
    addTranscript,
  } = useOnboarding();

  const { t } = useI18n();

  const [location, setLocation] = useState(onboardingData.location || "");

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

      const loc = extractedProfile?.location || "";
      if (loc) {
        setLocation(loc);
        updateField("location", loc);
      }
    },
  });

  /*
    TAP SELECT
  */
  const selectLocation = (city) => {
    setLocation(city);
    updateField("location", city);
  };

  /*
    CONTINUE
  */
  const handleContinue = () => {
    if (!location) {
      Alert.alert("Required", "Please select or enter your city.");
      return;
    }
    updateField("location", location);
    navigation.navigate("PreferencesQuestion");
  };

 
  const renderVoice = () => {

    if (voiceState === VOICE_STATE.PROCESSING) {
      return (
        <View style={styles.voiceCenter}>
          <ActivityIndicator size="large" color="#E85D04" style={{ marginBottom: 10 }} />
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
              i + 1 <= 4 ? styles.progressActive : styles.progressInactive,
            ]}
          />
        ))}
      </View>

      <Text style={styles.title}>{t("whichCity") || "Which city do you work in?"}</Text>
      <Text style={styles.subtitle}>{t("citySubtitle") || "Type, select a city, or speak your location."}</Text>

      {/* TEXT INPUT */}
      <TextInput
        style={styles.input}
        placeholder={t("enterCity") || "Enter city"}
        value={location}
        onChangeText={setLocation}
      />

      {/* VOICE */}
      {renderVoice()}

      {/* TRANSCRIPT */}
      {transcript ? (
        <View style={styles.transcriptBox}>
          <Text style={styles.transcriptLabel}>{t("transcript") || "Transcript"}</Text>
          <Text style={styles.transcriptText}>{transcript}</Text>
        </View>
      ) : null}

      {/* CITY CHIPS */}
      <ScrollView contentContainerStyle={styles.optionsContainer}>
        {LOCATION_OPTIONS.map((city) => {
          const isSelected = location === city;
          return (
            <TouchableOpacity
              key={city}
              style={[styles.optionChip, isSelected && styles.selectedChip]}
              onPress={() => selectLocation(city)}
            >
              <Text style={[styles.optionText, isSelected && styles.selectedText]}>
                {t("cities." + city) || city}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

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
    justifyContent: "flex-start",
    backgroundColor: "#FAF9F6",
  },

  progressContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 30,
  },
  progressSegment: { flex: 1, height: 4, borderRadius: 2 },
  progressActive:  { backgroundColor: "#E85D04" },
  progressInactive:{ backgroundColor: "#E5E7EB" },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 24,
  },

  input: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 16,
    fontSize: 17,
    marginBottom: 20,
    backgroundColor: "#fff",
    color: "#111827",
  },

  /* VOICE */
  voiceCenter: {
    alignItems: "center",
    marginBottom: 22,
  },
  holdLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  hintText: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 8,
  },
  processingLabel: {
    color: "#E85D04",
    fontWeight: "700",
    fontSize: 15,
  },
  recordedBadge: {
    backgroundColor: "#F0FDF4",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  recordedBadgeText: {
    color: "#15803D",
    fontWeight: "700",
    fontSize: 14,
  },
  actionRow:  { flexDirection: "row", gap: 10 },
  actionBtn:  { paddingVertical: 11, paddingHorizontal: 16, borderRadius: 12, alignItems: "center" },
  playBtn:    { backgroundColor: "#2563EB" },
  retakeBtn:  { backgroundColor: "#6B7280" },
  submitBtn:  { backgroundColor: "#16A34A" },
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

  /* CHIPS */
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  optionChip: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  selectedChip: {
    backgroundColor: "#FFF4ED",
    borderColor: "#E85D04",
  },
  optionText: { fontSize: 15, color: "#4B5563", fontWeight: "600" },
  selectedText: { color: "#E85D04", fontWeight: "bold" },

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
  },
  continueText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
});