import { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from "react-native";
import useVoiceRecorder, { VOICE_STATE } from "../hooks/useVoiceRecorder";
import VoiceButton from "../components/VoiceButton";
import { useOnboarding } from "../context/OnboardingContext";
import { SKILLS_BY_ROLE } from "../constants/skills";
import { useI18n } from "../context/I18nContext";
import OnboardingStepLayout, { onboardingStyles as os } from "../components/OnboardingStepLayout";
import { COLORS, BORDER_RADIUS } from "../constants/theme";

export default function SkillsQuestionScreen({ navigation }) {
  const { onboardingData, updateField, addTranscript } = useOnboarding();
  const { t } = useI18n();

  const [selectedSkills, setSelectedSkills] = useState(onboardingData.skills || []);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [customSkill, setCustomSkill] = useState("");

  const role = onboardingData.canonicalRole || onboardingData.role || "";
  const roleSkills = SKILLS_BY_ROLE[role] || ["Welding", "Pipe Fitting", "Gas Cutting", "Wiring", "Painting"];

  const skillOptions = useMemo(() => {
    const fromRole = roleSkills.map((s) => ({ key: s, label: t(`skills.${s}`) || s }));
    const merged = [...fromRole, { key: "Other", label: "Other ?" }];
    const seen = new Set();
    return merged.filter((item) => {
      if (seen.has(item.key)) return false;
      seen.add(item.key);
      return true;
    });
  }, [role, roleSkills, t]);

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
      const extracted = ep?.skills || [];
      if (extracted.length > 0) {
        const merged = [...new Set([...selectedSkills, ...extracted])];
        setSelectedSkills(merged);
        updateField("skills", merged);
      }
    },
  });

  const toggleSkill = (skill) => {
    if (skill === "Other") {
      setShowOtherInput(true);
      return;
    }
    const updated = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(updated);
    updateField("skills", updated);
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim()) {
      const updated = [...new Set([...selectedSkills, customSkill.trim()])];
      setSelectedSkills(updated);
      updateField("skills", updated);
      setCustomSkill("");
      setShowOtherInput(false);
    }
  };

  const handleContinue = () => {
    if (selectedSkills.length === 0) {
      Alert.alert(t("required") || "Required", t("selectAtLeastOne") || "Please select at least one skill.");
      return;
    }
    navigation.navigate("ExperienceQuestion");
  };

  const isFormValid = selectedSkills.length > 0;

  return (
    <OnboardingStepLayout
      navigation={navigation}
      screenTitle="Skills (2/5)"
      step={2}
      title="What are your skills?"
      subtitle="Select or say your skills"
      onContinue={handleContinue}
      continueDisabled={!isFormValid}
      variant="labour"
    >
      <View style={os.chipRow}>
        {skillOptions.map((item) => {
          const isSelected = selectedSkills.includes(item.key);
          return (
            <TouchableOpacity
              key={item.key}
              style={[os.chip, isSelected && os.chipSelectedLabour]}
              onPress={() => toggleSkill(item.key)}
            >
              <Text style={[os.chipText, isSelected && os.chipTextSelected]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Render Custom Selected Skills as pills too if they aren't in options */}
      <View style={os.chipRow}>
        {selectedSkills.filter(s => !skillOptions.find(o => o.key === s)).map(custom => (
          <TouchableOpacity
            key={custom}
            style={[os.chip, os.chipSelectedLabour]}
            onPress={() => toggleSkill(custom)}
          >
            <Text style={[os.chipText, os.chipTextSelected]}>{custom} ?</Text>
          </TouchableOpacity>
        ))}
      </View>

      {showOtherInput && (
        <View style={styles.customInputRow}>
          <TextInput
            style={[os.inputFlex, styles.customInput]}
            placeholder="Type your skill..."
            placeholderTextColor={COLORS.textLight}
            value={customSkill}
            onChangeText={setCustomSkill}
            autoFocus
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddCustomSkill}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.voiceRow}>
        <VoiceButton
          isRecording={voiceState === VOICE_STATE.RECORDING}
          onPressIn={startRecording}
          onPressOut={stopRecording}
        />
        <Text style={styles.voiceHint}>Hold mic and say: "I know welding, pipe fitting, gas cutting."</Text>
      </View>
      
      {voiceState === VOICE_STATE.CONFIRMED && (extractedProfile?.skills || []).length > 0 ? (
        <View style={styles.detectedBox}>
          <Text style={styles.detectedText}>
            Detected: {(extractedProfile.skills || []).join(", ")}
          </Text>
          <TouchableOpacity onPress={confirmExtraction}>
            <Text style={styles.useText}>? Keep</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={rejectExtraction}>
            <Text style={styles.rejectText}>?</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  customInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
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
