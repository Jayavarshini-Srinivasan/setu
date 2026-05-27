import { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";

import useVoiceRecorder, { VOICE_STATE } from "../hooks/useVoiceRecorder";
import VoiceButton from "../components/VoiceButton";
import { useOnboarding } from "../context/OnboardingContext";
import { SKILLS_BY_ROLE } from "../constants/skills";
import { useI18n } from "../context/I18nContext";
import OnboardingStepLayout from "../components/OnboardingStepLayout";
import { COLORS, BORDER_RADIUS } from "../constants/theme";

const SKILL_ICONS = {
  driving: "🚗",
  navigation: "🧭",
  "auto rickshaw": "🛺",
  "customer service": "🤝",
  "road safety": "🛑",
  "app usage": "📱",
  "parcel delivery": "📦",
  "time management": "⏱️",
  "two-wheeler riding": "🛵",
  loading: "📦",
  "vehicle maintenance": "🔧",
  "passenger handling": "👥",
  "schedule adherence": "📅",
  electrician: "⚡",
  wiring: "🔌",
  "safety compliance": "🦺",
  masonry: "🧱",
  carpentry: "🔨",
  plumbing: "🔧",
  construction: "🏗️",
  helper: "👷",
  cleaning: "🧹",
  cooking: "🍳",
  security: "🛡️",
  default: "💼",
};

const DISPLAY_SKILLS = [
  { key: "driving", label: "Driver", icon: "🚗" },
  { key: "electrician", label: "Electrician", icon: "⚡" },
  { key: "plumbing", label: "Plumber", icon: "🔧" },
  { key: "masonry", label: "Mason", icon: "🧱" },
  { key: "helper", label: "Helper", icon: "🏗️" },
  { key: "parcel delivery", label: "Delivery", icon: "🛵" },
  { key: "cleaning", label: "Cleaner", icon: "🧹" },
  { key: "cooking", label: "Cook", icon: "🍳" },
  { key: "carpentry", label: "Carpenter", icon: "🔨" },
  { key: "construction", label: "Gardener", icon: "🌿" },
  { key: "security", label: "Security", icon: "🛡️" },
  { key: "loading", label: "Loader", icon: "📦" },
];

export default function SkillsQuestionScreen({ navigation }) {
  const { onboardingData, updateField, addTranscript } = useOnboarding();
  const { t } = useI18n();

  const [selectedSkills, setSelectedSkills] = useState(onboardingData.skills || []);

  const role = onboardingData.canonicalRole || onboardingData.role || "";
  const roleSkills = SKILLS_BY_ROLE[role] || [];

  const skillOptions = useMemo(() => {
    const fromRole = roleSkills.map((s) => ({
      key: s,
      label: t(`skills.${s}`) || s,
      icon: SKILL_ICONS[s?.toLowerCase?.()] || SKILL_ICONS[s] || SKILL_ICONS.default,
    }));
    const merged = [...DISPLAY_SKILLS.map((d) => ({ ...d, key: d.key })), ...fromRole];
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
      const merged = [...new Set([...selectedSkills, ...extracted])];
      setSelectedSkills(merged);
      updateField("skills", merged);
    },
  });

  const toggleSkill = (skill) => {
    const updated = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(updated);
    updateField("skills", updated);
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
      screenTitle="Skills (2/4)"
      step={2}
      title="Your Skills"
      subtitle="Select all that apply. आप क्या काम करते हैं?"
      onContinue={handleContinue}
      continueDisabled={!isFormValid}
      variant="labour"
    >
      <View style={styles.skillGrid}>
        {skillOptions.slice(0, 12).map((item) => {
          const isSelected = selectedSkills.includes(item.key);
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.skillCard, isSelected && styles.skillCardSelected]}
              onPress={() => toggleSkill(item.key)}
              activeOpacity={0.85}
            >
              <Text style={styles.skillIcon}>{item.icon}</Text>
              <Text style={[styles.skillLabel, isSelected && styles.skillLabelSelected]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.voiceRow}>
        <VoiceButton
          isRecording={voiceState === VOICE_STATE.RECORDING}
          onPressIn={startRecording}
          onPressOut={stopRecording}
        />
        <Text style={styles.voiceHint}>{t("holdToSpeak") || "Hold to speak your skills"}</Text>
      </View>

      {voiceState === VOICE_STATE.CONFIRMED && (extractedProfile?.skills || []).length > 0 ? (
        <View style={styles.detectedBox}>
          <Text style={styles.detectedText}>
            {(extractedProfile.skills || []).join(", ")}
          </Text>
          <TouchableOpacity onPress={confirmExtraction}>
            <Text style={styles.useText}>✓ Add</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={rejectExtraction}>
            <Text style={styles.rejectText}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  skillGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  skillCard: {
    width: "31%",
    minWidth: 100,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    alignItems: "center",
  },
  skillCardSelected: {
    backgroundColor: COLORS.accentLight,
    borderColor: COLORS.accent,
  },
  skillIcon: { fontSize: 24, marginBottom: 6 },
  skillLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  skillLabelSelected: { color: COLORS.accent },
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
