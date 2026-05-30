import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import useVoiceRecorder from "../hooks/useVoiceRecorder";
import VoiceTranscriptionControls from "../components/VoiceTranscriptionControls";
import { useOnboarding } from "../context/OnboardingContext";
import { useI18n } from "../context/I18nContext";
import OnboardingStepLayout, { onboardingStyles as os } from "../components/OnboardingStepLayout";
import { COLORS, BORDER_RADIUS } from "../constants/theme";

const AVAILABILITY_OPTIONS = ["full-time", "part-time", "flexible"];
const SHIFT_OPTIONS = ["morning", "afternoon", "night"];

export default function PreferencesQuestionScreen({ navigation }) {
  const { onboardingData, updateField, addTranscript } = useOnboarding();
  const { t } = useI18n();

  const [wage, setWage] = useState(onboardingData.expectedWage?.replace(/[^0-9]/g, "") || "");
  const [wagePeriod, setWagePeriod] = useState(onboardingData.expectedWage?.includes("month") ? "month" : "day");
  const [availability, setAvailability] = useState(onboardingData.availability || "");
  const [shift, setShift] = useState(onboardingData.preferredShift || "");
  const [transport, setTransport] = useState(onboardingData.transportAccess ?? false);

  const {
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
  } = useVoiceRecorder({
    onResult: ({ transcript: tx, extractedProfile: ep }) => {
      if (tx) addTranscript(tx);
      if (ep?.expectedWage) {
        setWage(ep.expectedWage.replace(/[^0-9]/g, ""));
        setWagePeriod(ep.expectedWage.includes("month") ? "month" : "day");
      }
      if (ep?.availability) setAvailability(ep.availability);
      if (ep?.preferredShift) setShift(ep.preferredShift);
      if (ep?.transportAccess !== undefined) setTransport(Boolean(ep.transportAccess));
    },
    screenType: "labour_preferences",
  });

  const handleContinue = () => {
    if (!wage || !availability || !shift) {
      Alert.alert(t("required") || "Required", "Please fill in all details.");
      return;
    }
    updateField("expectedWage", `${wage}/${wagePeriod}`);
    updateField("availability", availability);
    updateField("preferredShift", shift);
    updateField("transportAccess", transport);
    navigation.navigate("ReviewOnboarding");
  };

  const isFormValid = Boolean(wage) && Boolean(availability) && Boolean(shift);

  return (
    <OnboardingStepLayout
      navigation={navigation}
      screenTitle="Preferences (5/5)"
      step={5}
      totalSteps={5}
      title="Work Preferences"
      subtitle="How and when do you want to work?"
      onContinue={handleContinue}
      continueDisabled={!isFormValid}
      variant="labour"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        <Text style={os.label}>EXPECTED WAGE (?)</Text>
        <View style={styles.wageRow}>
          <TextInput
            style={styles.wageInput}
            placeholder="e.g. 600"
            placeholderTextColor={COLORS.textLight}
            value={wage}
            onChangeText={setWage}
            keyboardType="numeric"
          />
          <View style={styles.periodToggle}>
            <TouchableOpacity 
              style={[styles.periodBtn, wagePeriod === "day" && styles.periodBtnActive]}
              onPress={() => setWagePeriod("day")}
            >
              <Text style={[styles.periodText, wagePeriod === "day" && styles.periodTextActive]}>Per day</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodBtn, wagePeriod === "month" && styles.periodBtnActive]}
              onPress={() => setWagePeriod("month")}
            >
              <Text style={[styles.periodText, wagePeriod === "month" && styles.periodTextActive]}>Per month</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={os.label}>AVAILABILITY</Text>
        <View style={styles.cardList}>
          {AVAILABILITY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.cardRow, availability === opt && styles.cardRowSelected]}
              onPress={() => setAvailability(opt)}
            >
              <Text style={[styles.cardText, availability === opt && styles.cardTextSelected]}>
                {opt === "full-time" ? "Full time" : opt === "part-time" ? "Part time" : "Flexible"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[os.label, { marginTop: 24 }]}>PREFERRED SHIFT</Text>
        <View style={styles.cardList}>
          {SHIFT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.cardRow, shift === opt && styles.cardRowSelected]}
              onPress={() => setShift(opt)}
            >
              <Text style={[styles.cardText, shift === opt && styles.cardTextSelected]}>
                {opt === "morning" ? "Morning" : opt === "afternoon" ? "Afternoon" : "Night"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[os.label, { marginTop: 24 }]}>DO YOU HAVE YOUR OWN VEHICLE?</Text>
        <TouchableOpacity
          style={[styles.cardRow, transport === true && styles.cardRowSelected]}
          onPress={() => setTransport(!transport)}
        >
          <View style={styles.radioOuter}>
            {transport && <View style={styles.radioInner} />}
          </View>
          <Text style={[styles.cardText, transport && styles.cardTextSelected]}>
            Yes, I have my own vehicle
          </Text>
        </TouchableOpacity>

        <VoiceTranscriptionControls
          voiceState={voiceState}
          transcript={transcript}
          extractedProfile={extractedProfile}
          errorMessage={errorMessage}
          isPlaying={isPlaying}
          hint={'Hold mic and say: "I want 600 per day, I can work mornings, I have a bike."'}
          detectedValue={`${extractedProfile?.expectedWage || ""} ${extractedProfile?.preferredShift ? "| " + extractedProfile.preferredShift : ""}`.trim()}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onPlayRecording={playRecording}
          onRetakeRecording={retakeRecording}
          onSubmitRecording={submitRecording}
          onTranscriptChange={setTranscript}
          onConfirm={confirmExtraction}
          onReject={rejectExtraction}
        />
        
        {false && (
          <View style={styles.detectedBox}>
            <Text style={styles.detectedText}>
              Detected: {extractedProfile.expectedWage} | {extractedProfile.preferredShift} | {extractedProfile.transportAccess ? "Has vehicle" : "No vehicle"}
            </Text>
            <TouchableOpacity onPress={confirmExtraction}>
              <Text style={styles.useText}>? Keep</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={rejectExtraction}>
              <Text style={styles.rejectText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  wageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  wageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: COLORS.surface,
    color: COLORS.text,
  },
  periodToggle: {
    flexDirection: "row",
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
  },
  periodBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.sm,
  },
  periodBtnActive: {
    backgroundColor: COLORS.surface,
  },
  periodText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  periodTextActive: {
    color: COLORS.text,
    fontWeight: "700",
  },
  cardList: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  cardRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
  },
  cardRowSelected: {
    backgroundColor: COLORS.accentLight,
    borderColor: COLORS.accent,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textLight,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
  },
  cardText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: "500", textAlign: "center" },
  cardTextSelected: { color: COLORS.accent, fontWeight: "700" },
  voiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
  },
  voiceHint: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  detectedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.accentLight,
    borderRadius: BORDER_RADIUS.md,
  },
  detectedText: { flex: 1, fontSize: 13, color: COLORS.text },
  useText: { color: COLORS.success, fontWeight: "700" },
  rejectText: { color: COLORS.textLight, fontSize: 18 },
});
