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
} from "react-native";

import VoiceButton from "../components/VoiceButton";
import useVoiceRecorder, { VOICE_STATE } from "../hooks/useVoiceRecorder";
import { useOnboarding } from "../context/OnboardingContext";
import { useI18n } from "../context/I18nContext";
import OnboardingStepLayout, { onboardingStyles as os } from "../components/OnboardingStepLayout";
import { COLORS, BORDER_RADIUS } from "../constants/theme";

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
  const { onboardingData, updateField, addTranscript } = useOnboarding();
  const { t } = useI18n();

  const [location, setLocation] = useState(onboardingData.location || "");

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

  const selectLocation = (city) => {
    setLocation(city);
    updateField("location", city);
  };

  const handleContinue = () => {
    if (!isFormValid) {
      Alert.alert(t("required") || "Required", t("enterLocation") || "Please select or enter location");
      return;
    }
    updateField("location", location);
    navigation.navigate("PreferencesQuestion");
  };

  const isFormValid = Boolean(location.trim());

  return (
    <OnboardingStepLayout
      navigation={navigation}
      screenTitle="Location (4/4)"
      step={4}
      title={t("whichCity") || "Which city do you work in?"}
      subtitle={t("citySubtitle") || "Type, select a city, or speak your location."}
      onContinue={handleContinue}
      continueDisabled={!isFormValid}
      variant="labour"
    >
      <TextInput
        style={styles.input}
        placeholder={t("enterCity") || "Enter city"}
        placeholderTextColor={COLORS.textLight}
        value={location}
        onChangeText={setLocation}
      />

      <View style={styles.voiceRow}>
        {voiceState === VOICE_STATE.PROCESSING ? (
          <ActivityIndicator size="large" color={COLORS.accent} />
        ) : (
          <>
            <VoiceButton
              isRecording={voiceState === VOICE_STATE.RECORDING}
              onPressIn={startRecording}
              onPressOut={stopRecording}
            />
            <Text style={styles.voiceHint}>{t("holdToSpeak") || "Hold to speak"}</Text>
          </>
        )}
      </View>

      {voiceState === VOICE_STATE.RECORDED && (
        <View style={styles.voiceActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={playRecording}>
            <Text style={styles.actionBtnText}>▶ Play</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={retakeRecording}>
            <Text style={styles.actionBtnText}>🔄 Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.submitBtn]} onPress={submitRecording}>
            <Text style={styles.actionBtnText}>✅ Submit</Text>
          </TouchableOpacity>
        </View>
      )}

      {transcript ? (
        <View style={styles.transcriptBox}>
          <Text style={styles.transcriptLabel}>{t("transcript") || "Transcript"}</Text>
          <Text style={styles.transcriptText}>{transcript}</Text>
        </View>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cityRow}
      >
        {LOCATION_OPTIONS.map((city) => {
          const isSelected = location === city;
          return (
            <TouchableOpacity
              key={city}
              style={[styles.cityChip, isSelected && styles.cityChipSelected]}
              onPress={() => selectLocation(city)}
            >
              <Text style={[styles.cityChipText, isSelected && styles.cityChipTextSelected]}>
                {t("cities." + city) || city}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    fontSize: 17,
    color: COLORS.text,
    marginBottom: 16,
  },
  voiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  voiceHint: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  voiceActions: { flexDirection: "row", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
  },
  submitBtn: { backgroundColor: COLORS.successLight },
  actionBtnText: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  transcriptBox: {
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  transcriptLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textLight,
    marginBottom: 6,
  },
  transcriptText: { fontSize: 14, color: COLORS.text, fontStyle: "italic" },
  cityRow: { gap: 10, paddingVertical: 8 },
  cityChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  cityChipSelected: {
    backgroundColor: COLORS.accentLight,
    borderColor: COLORS.accent,
  },
  cityChipText: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary },
  cityChipTextSelected: { color: COLORS.accent },
});
