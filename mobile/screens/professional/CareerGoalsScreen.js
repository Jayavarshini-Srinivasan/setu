import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import useVoiceRecorder from "../../hooks/useVoiceRecorder";
import VoiceTranscriptionControls from "../../components/VoiceTranscriptionControls";
import { useOnboarding } from "../../context/OnboardingContext";
import { useI18n } from "../../context/I18nContext";
import OnboardingStepLayout, { onboardingStyles as os } from "../../components/OnboardingStepLayout";
import { COLORS, BORDER_RADIUS } from "../../constants/theme";

const CURRENCIES = ["INR", "GBP", "USD"];
const TARGET_ROLES = ["Finance Manager", "Senior Accountant", "Auditor", "Tax Consultant", "Financial Analyst", "Operations Manager", "HR Director", "Project Manager", "Software Architect", "Data Scientist", "Marketing Head", "Sales Director"];

export default function CareerGoalsScreen({ navigation }) {
  const { onboardingData, updateField, addTranscript } = useOnboarding();
  const { t } = useI18n();

  const [minSalary, setMinSalary] = useState(onboardingData.expectedSalary?.min ? String(onboardingData.expectedSalary.min) : "");
  const [maxSalary, setMaxSalary] = useState(onboardingData.expectedSalary?.max ? String(onboardingData.expectedSalary.max) : "");
  const [currency, setCurrency] = useState(onboardingData.expectedSalary?.currency || "INR");
  
  const [careerGoal, setCareerGoal] = useState(onboardingData.careerGoal || "");
  const [preferredRoles, setPreferredRoles] = useState(onboardingData.preferredRoles || []);

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
      if (ep?.expectedSalary) {
        if (ep.expectedSalary.min) setMinSalary(String(ep.expectedSalary.min));
        if (ep.expectedSalary.max) setMaxSalary(String(ep.expectedSalary.max));
        if (ep.expectedSalary.currency) setCurrency(ep.expectedSalary.currency);
      }
      if (ep?.careerGoal) setCareerGoal(ep.careerGoal);
    },
    contextData: onboardingData,
  });

  const toggleRole = (role) => {
    const updated = preferredRoles.includes(role)
      ? preferredRoles.filter((r) => r !== role)
      : [...preferredRoles, role];
    setPreferredRoles(updated);
  };

  const isFormValid = Boolean(minSalary) && Boolean(careerGoal.trim()) && preferredRoles.length > 0;

  const handleContinue = () => {
    if (!isFormValid) {
      Alert.alert(t("required") || "Required", "Please provide your salary expectation, career goal, and select at least one preferred role.");
      return;
    }

    updateField("expectedSalary", { min: Number(minSalary), max: Number(maxSalary) || Number(minSalary), currency });
    updateField("careerGoal", careerGoal.trim());
    updateField("preferredRoles", preferredRoles);

    navigation.navigate("ProfessionalLinks");
  };

  return (
    <OnboardingStepLayout
      navigation={navigation}
      screenTitle="Goals (5/6)"
      step={5}
      totalSteps={6}
      badge="PROFESSIONAL"
      title="Salary & Career Goals"
      subtitle="What are you aiming for?"
      onContinue={handleContinue}
      continueDisabled={!isFormValid}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        <Text style={os.label}>EXPECTED SALARY / MONTH</Text>
        
        <View style={styles.currencyToggle}>
          {CURRENCIES.map(curr => (
            <TouchableOpacity key={curr} style={[styles.currencyBtn, currency === curr && styles.currencyBtnActive]} onPress={() => setCurrency(curr)}>
              <Text style={[styles.currencyText, currency === curr && styles.currencyTextActive]}>{curr}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.salaryRow}>
          <TextInput
            style={styles.salaryInput}
            placeholder="Min"
            placeholderTextColor={COLORS.textLight}
            value={minSalary}
            onChangeText={setMinSalary}
            keyboardType="numeric"
          />
          <Text style={{ marginHorizontal: 12, color: COLORS.textLight }}>to</Text>
          <TextInput
            style={styles.salaryInput}
            placeholder="Max"
            placeholderTextColor={COLORS.textLight}
            value={maxSalary}
            onChangeText={setMaxSalary}
            keyboardType="numeric"
          />
        </View>

        <Text style={[os.label, { marginTop: 24 }]}>YOUR CAREER GOAL</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: "top" }]}
          placeholder="e.g. I want to become a Finance Manager within the next 3 years..."
          placeholderTextColor={COLORS.textLight}
          multiline
          value={careerGoal}
          onChangeText={setCareerGoal}
        />

        <Text style={[os.label, { marginTop: 24 }]}>TARGET ROLES</Text>
        <View style={os.chipRow}>
          {TARGET_ROLES.map((role) => {
            const isSelected = preferredRoles.includes(role);
            return (
              <TouchableOpacity
                key={role}
                style={[os.chip, isSelected && os.chipSelected]}
                onPress={() => toggleRole(role)}
              >
                <Text style={[os.chipText, isSelected && os.chipTextSelected]}>
                  {role}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.voiceSection}>
          <VoiceTranscriptionControls
            voiceState={voiceState}
            transcript={transcript}
            extractedProfile={extractedProfile}
            errorMessage={errorMessage}
            isPlaying={isPlaying}
            hint={'Hold mic and say: "I want at least 35,000 per month and my goal is to become a finance manager."'}
            detectedValue={`${extractedProfile?.expectedSalary ? "Salary: " + extractedProfile.expectedSalary.min : ""} ${extractedProfile?.careerGoal ? "| Goal: " + extractedProfile.careerGoal : ""}`.trim()}
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
              <Text style={styles.detectedText}>{extractedProfile.expectedSalary ? `Salary: ${extractedProfile.expectedSalary.min}` : ""} {extractedProfile.careerGoal ? `| Goal: ${extractedProfile.careerGoal}` : ""}</Text>
              <View style={styles.detectedActions}>
                <TouchableOpacity onPress={confirmExtraction}><Text style={styles.confirmText}>✓ Keep</Text></TouchableOpacity>
                <TouchableOpacity onPress={rejectExtraction}><Text style={styles.rejectText}>✕</Text></TouchableOpacity>
              </View>
            </View>
          )}
        </View>

      </ScrollView>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  currencyToggle: { flexDirection: "row", backgroundColor: COLORS.border, borderRadius: BORDER_RADIUS.md, padding: 4, marginBottom: 12 },
  currencyBtn: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: BORDER_RADIUS.sm },
  currencyBtnActive: { backgroundColor: COLORS.surface },
  currencyText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: "600" },
  currencyTextActive: { color: COLORS.text, fontWeight: "700" },
  salaryRow: { flexDirection: "row", alignItems: "center" },
  salaryInput: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, padding: 16, fontSize: 16, backgroundColor: COLORS.surface, color: COLORS.text },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, padding: 12, backgroundColor: COLORS.surface, marginTop: 8, fontSize: 15 },
  voiceSection: { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  voiceHint: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  voiceRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  detectedBox: { marginTop: 16, backgroundColor: COLORS.primaryLight, padding: 14, borderRadius: 12, flexDirection: "row", alignItems: "center" },
  detectedText: { fontSize: 13, fontWeight: "600", color: COLORS.text, flex: 1 },
  detectedActions: { flexDirection: "row", alignItems: "center", gap: 16 },
  confirmText: { color: COLORS.success, fontWeight: "700" },
  rejectText: { color: COLORS.textLight, fontSize: 18 },
});
