import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import VoiceButton from "../../components/VoiceButton";
import { useOnboarding } from "../../context/OnboardingContext";
import { useI18n } from "../../context/I18nContext";
import OnboardingStepLayout, { onboardingStyles as os } from "../../components/OnboardingStepLayout";
import { COLORS, BORDER_RADIUS } from "../../constants/theme";
import useVoiceRecorder, { VOICE_STATE } from "../../hooks/useVoiceRecorder";

const ROLE_OPTIONS = [
  "Accountant",
  "Supervisor",
  "Manager",
  "HR Executive",
  "Office Admin",
  "Coordinator",
  "Analyst",
  "Engineer",
  "Software Developer",
  "Data Entry",
  "Sales Executive",
  "Customer Support",
];

export default function ProfessionalRoleScreen({ navigation }) {
  const { onboardingData, updateField, addTranscript } = useOnboarding();
  const { t } = useI18n();

  const [fullName, setFullName] = useState(onboardingData.resumeSummary?.split("|")[0] || onboardingData.fullName || "");
  const [jobTitle, setJobTitle] = useState(onboardingData.professionalRole || "");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const {
    voiceState,
    extractedProfile,
    startRecording,
    stopRecording,
    confirmExtraction,
    rejectExtraction,
  } = useVoiceRecorder({
    onResult: ({ transcript: tx, extractedProfile: ep }) => {
      if (tx) addTranscript(tx);
      const role = ep?.professionalRole || ep?.rawRole || ep?.canonicalRole || "";
      if (role) {
        setJobTitle(role);
      }
      if (ep?.fullName) {
        setFullName(ep.fullName);
      }
    },
  });

  const filteredRoles = ROLE_OPTIONS.filter(
    r => r.toLowerCase().includes(jobTitle.toLowerCase()) && r.toLowerCase() !== jobTitle.toLowerCase()
  );

  const handleContinue = () => {
    if (!fullName.trim() || !jobTitle.trim()) {
      Alert.alert(t("required") || "Required", "Please complete all fields.");
      return;
    }

    updateField("professionalRole", jobTitle.trim());
    updateField("fullName", fullName.trim());
    updateField("resumeSummary", `${fullName.trim()}|${jobTitle.trim()}`);
    updateField("workerType", "professional");

    navigation.navigate("ProfessionalSkills");
  };

  const isFormValid = Boolean(fullName.trim()) && Boolean(jobTitle.trim());

  return (
    <OnboardingStepLayout
      navigation={navigation}
      screenTitle="Profile (1/6)"
      step={1}
      totalSteps={6}
      badge="PROFESSIONAL"
      title="Basic Info"
      subtitle="Your professional identity."
      onContinue={handleContinue}
      continueDisabled={!isFormValid}
    >
      <View style={os.inputRow}>
        <Ionicons name="person-outline" size={20} color={COLORS.textLight} style={{ marginRight: 10 }} />
        <TextInput
          style={os.inputFlex}
          placeholder={t("fullName") || "Full name"}
          placeholderTextColor={COLORS.textLight}
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      <Text style={[os.label, { marginTop: 12 }]}>PROFESSIONAL ROLE</Text>
      <View style={{ zIndex: 10 }}>
        <View style={[os.inputRow, { marginTop: 8 }]}>
          <Ionicons name="briefcase-outline" size={20} color={COLORS.textLight} style={{ marginRight: 10 }} />
          <TextInput
            style={os.inputFlex}
            placeholder="e.g. Accountant, Supervisor..."
            placeholderTextColor={COLORS.textLight}
            value={jobTitle}
            onChangeText={(v) => { setJobTitle(v); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
          />
        </View>
        
        {showSuggestions && jobTitle.trim().length > 0 && filteredRoles.length > 0 && (
          <View style={styles.autocompleteBox}>
            {filteredRoles.map(r => (
              <TouchableOpacity key={r} style={styles.suggestionItem} onPress={() => { setJobTitle(r); setShowSuggestions(false); }}>
                <Text style={styles.suggestionText}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.voiceSection}>
        <Text style={styles.voiceHint}>
          Hold mic and say: "My name is Priya, I am an HR Executive."
        </Text>
        <View style={styles.voiceRow}>
          <VoiceButton
            isRecording={voiceState === VOICE_STATE.RECORDING}
            onPressIn={startRecording}
            onPressOut={stopRecording}
          />
        </View>
        {voiceState === VOICE_STATE.CONFIRMED && (extractedProfile?.fullName || extractedProfile?.rawRole || extractedProfile?.canonicalRole) ? (
          <View style={styles.detectedBox}>
            <Text style={styles.detectedLabel}>Detected</Text>
            <Text style={styles.detectedValue}>
              {extractedProfile.fullName ? extractedProfile.fullName + " � " : ""}{extractedProfile.rawRole || extractedProfile.canonicalRole || extractedProfile.professionalRole}
            </Text>
            <View style={styles.detectedActions}>
              <TouchableOpacity onPress={confirmExtraction} style={styles.confirmBtn}>
                <Text style={styles.confirmText}>✓ Use</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={rejectExtraction}>
                <Text style={styles.rejectText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  autocompleteBox: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: BORDER_RADIUS.md,
    borderBottomRightRadius: BORDER_RADIUS.md,
    maxHeight: 150,
  },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  suggestionText: { fontSize: 15, color: COLORS.text },
  voiceSection: { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  voiceHint: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 12, textAlign: "center" },
  voiceRow: { alignItems: "center", gap: 12 },
  detectedBox: { marginTop: 16, backgroundColor: COLORS.primaryLight, padding: 14, borderRadius: 12 },
  detectedLabel: { fontSize: 12, fontWeight: "700", color: COLORS.primary, marginBottom: 4 },
  detectedValue: { fontSize: 16, fontWeight: "600", color: COLORS.text, marginBottom: 10 },
  detectedActions: { flexDirection: "row", alignItems: "center", gap: 16 },
  confirmText: { color: COLORS.success, fontWeight: "700" },
  rejectText: { color: COLORS.textLight, fontSize: 18 },
});
