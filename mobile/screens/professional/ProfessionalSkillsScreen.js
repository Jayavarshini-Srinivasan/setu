import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, ScrollView } from "react-native";
import useVoiceRecorder, { VOICE_STATE } from "../../hooks/useVoiceRecorder";
import VoiceButton from "../../components/VoiceButton";
import { useOnboarding } from "../../context/OnboardingContext";
import { useI18n } from "../../context/I18nContext";
import OnboardingStepLayout, { onboardingStyles as os } from "../../components/OnboardingStepLayout";
import { COLORS, BORDER_RADIUS } from "../../constants/theme";

const SKILL_CATEGORIES = [
  {
    title: "Software",
    skills: ["Tally", "Excel", "SAP", "QuickBooks", "AutoCAD", "Salesforce"]
  },
  {
    title: "Office",
    skills: ["MS Word", "PowerPoint", "Email", "Data Entry", "Scheduling"]
  },
  {
    title: "Domain",
    skills: ["GST", "Payroll", "Accounting", "Logistics", "Marketing", "HR"]
  }
];

export default function ProfessionalSkillsScreen({ navigation }) {
  const { onboardingData, updateField, addTranscript } = useOnboarding();
  const { t } = useI18n();

  const [selectedSkills, setSelectedSkills] = useState(onboardingData.professionalSkills || []);
  const [customSkill, setCustomSkill] = useState("");

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
      const extracted = ep?.professionalSkills || ep?.skills || [];
      if (extracted.length > 0) {
        const merged = [...new Set([...selectedSkills, ...extracted.map(s => String(s).trim())])];
        setSelectedSkills(merged);
        updateField("professionalSkills", merged);
      }
    },
  });

  const toggleSkill = (skill) => {
    const updated = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(updated);
    updateField("professionalSkills", updated);
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim()) {
      const updated = [...new Set([...selectedSkills, customSkill.trim()])];
      setSelectedSkills(updated);
      updateField("professionalSkills", updated);
      setCustomSkill("");
    }
  };

  const handleContinue = () => {
    if (selectedSkills.length === 0) {
      Alert.alert(t("required") || "Required", "Please select at least one skill.");
      return;
    }
    navigation.navigate("Education");
  };

  const isFormValid = selectedSkills.length > 0;

  // Flatten pre-defined skills to check for custom ones
  const predefinedSkills = SKILL_CATEGORIES.flatMap(c => c.skills.map(s => s.toLowerCase()));
  const customSelectedSkills = selectedSkills.filter(s => !predefinedSkills.includes(s.toLowerCase()));

  return (
    <OnboardingStepLayout
      navigation={navigation}
      screenTitle="Skills (2/6)"
      step={2}
      totalSteps={6}
      badge="PROFESSIONAL"
      title="Professional Skills"
      subtitle="What tools and skills do you know?"
      onContinue={handleContinue}
      continueDisabled={!isFormValid}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {SKILL_CATEGORIES.map((category) => (
          <View key={category.title} style={styles.categoryBlock}>
            <Text style={os.label}>{category.title.toUpperCase()}</Text>
            <View style={os.chipRow}>
              {category.skills.map((skill) => {
                const isSelected = selectedSkills.some(s => s.toLowerCase() === skill.toLowerCase());
                return (
                  <TouchableOpacity
                    key={skill}
                    style={[os.chip, isSelected && os.chipSelected]}
                    onPress={() => toggleSkill(skill)}
                  >
                    <Text style={[os.chipText, isSelected && os.chipTextSelected]}>
                      {skill}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {customSelectedSkills.length > 0 && (
          <View style={styles.categoryBlock}>
            <Text style={os.label}>OTHER ADDED</Text>
            <View style={os.chipRow}>
              {customSelectedSkills.map((skill) => (
                <TouchableOpacity
                  key={skill}
                  style={[os.chip, os.chipSelected]}
                  onPress={() => toggleSkill(skill)}
                >
                  <Text style={[os.chipText, os.chipTextSelected]}>{skill}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.customInputRow}>
          <TextInput
            style={[os.inputFlex, styles.customInput]}
            placeholder="Add another skill..."
            placeholderTextColor={COLORS.textLight}
            value={customSkill}
            onChangeText={setCustomSkill}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddCustomSkill}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.voiceRow}>
          <VoiceButton
            isRecording={voiceState === VOICE_STATE.RECORDING}
            onPressIn={startRecording}
            onPressOut={stopRecording}
          />
          <Text style={styles.voiceHint}>Hold mic and say: "I know Excel, Tally, GST filing, and payroll."</Text>
        </View>
        
        {voiceState === VOICE_STATE.CONFIRMED && (extractedProfile?.professionalSkills || extractedProfile?.skills || []).length > 0 ? (
          <View style={styles.detectedBox}>
            <Text style={styles.detectedText}>
              Detected: {(extractedProfile.professionalSkills || extractedProfile.skills || []).join(", ")}
            </Text>
            <TouchableOpacity onPress={confirmExtraction}>
              <Text style={styles.useText}>✓ Keep</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={rejectExtraction}>
              <Text style={styles.rejectText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : null}

      </ScrollView>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  categoryBlock: {
    marginBottom: 20,
  },
  customInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
    marginBottom: 24,
  },
  customInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: BORDER_RADIUS.md,
  },
  addButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  voiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  voiceHint: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  detectedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.md,
  },
  detectedText: { flex: 1, fontSize: 13, color: COLORS.text },
  useText: { color: COLORS.success, fontWeight: "700" },
  rejectText: { color: COLORS.textLight, fontSize: 18 },
});
