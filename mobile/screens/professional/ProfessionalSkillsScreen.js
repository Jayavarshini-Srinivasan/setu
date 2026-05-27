import { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useOnboarding } from "../../context/OnboardingContext";
import { useI18n } from "../../context/I18nContext";
import OnboardingStepLayout, { onboardingStyles as os } from "../../components/OnboardingStepLayout";
import { COLORS, BORDER_RADIUS } from "../../constants/theme";

const SKILL_META = {
  React: { icon: "⚛️" },
  Excel: { icon: "📊" },
  Tally: { icon: "📒" },
  GST: { icon: "🧾" },
  SQL: { icon: "🗄️" },
  Python: { icon: "🐍" },
  "UI Design": { icon: "🎨" },
  Figma: { icon: "🎨" },
  "Data Analysis": { icon: "📈" },
  Analytics: { icon: "📈" },
  Marketing: { icon: "📣" },
  JavaScript: { icon: "💻" },
  "React Native": { icon: "📱" },
  "Node.js": { icon: "🟢" },
  "Machine Learning": { icon: "🤖" },
  Communication: { icon: "💬" },
  Leadership: { icon: "👥" },
  "Project Management": { icon: "📋" },
  Firebase: { icon: "🔥" },
  Git: { icon: "🔀" },
  "API Development": { icon: "🔌" },
  "Power BI": { icon: "📉" },
  "Pivot Tables": { icon: "📊" },
  VLOOKUP: { icon: "🔍" },
  CyberSec: { icon: "🔒" },
  Cloud: { icon: "☁️" },
  Content: { icon: "✍️" },
};

const availableSkills = [
  "React",
  "Excel",
  "Tally",
  "GST",
  "SQL",
  "Python",
  "UI Design",
  "Figma",
  "Data Analysis",
  "Machine Learning",
  "Communication",
  "Leadership",
  "Project Management",
  "Marketing",
  "JavaScript",
  "React Native",
  "Node.js",
  "Firebase",
  "Git",
  "API Development",
];

const AI_SUGGESTED = ["Power BI", "Pivot Tables", "VLOOKUP"];

export default function ProfessionalSkillsScreen({ navigation }) {
  const { onboardingData, updateField } = useOnboarding();
  const { t } = useI18n();

  const [selectedSkills, setSelectedSkills] = useState(
    onboardingData.professionalSkills || []
  );
  const [search, setSearch] = useState("");

  const filteredSkills = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return availableSkills;
    return availableSkills.filter((s) => s.toLowerCase().includes(q));
  }, [search]);

  const toggleSkill = (skill) => {
    let updated = selectedSkills.includes(skill)
      ? selectedSkills.filter((item) => item !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(updated);
    updateField("professionalSkills", updated);
  };

  const handleContinue = () => {
    if (selectedSkills.length === 0) {
      Alert.alert(
        t("required") || "Required",
        t("selectSkillsError") || "Please select at least one skill"
      );
      return;
    }
    navigation.navigate("Education");
  };

  const isFormValid = selectedSkills.length > 0;

  return (
    <OnboardingStepLayout
      navigation={navigation}
      screenTitle="Skills (2/4)"
      step={2}
      badge="PROFESSIONAL"
      title={t("selectProfessionalSkills") || "Select your professional skills"}
      subtitle={
        t("skillsImproveMatching") ||
        "Select your strongest skills. AI will suggest more."
      }
      onContinue={handleContinue}
      continueDisabled={!isFormValid}
    >
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={COLORS.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search skills..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.skillGrid}>
        {filteredSkills.map((skill) => {
          const isSelected = selectedSkills.includes(skill);
          const meta = SKILL_META[skill] || { icon: "💼" };
          return (
            <TouchableOpacity
              key={skill}
              style={[styles.skillCard, isSelected && styles.skillCardSelected]}
              onPress={() => toggleSkill(skill)}
              activeOpacity={0.85}
            >
              <Text style={styles.skillIcon}>{meta.icon}</Text>
              <Text style={[styles.skillName, isSelected && styles.skillNameSelected]}>
                {t(`skills.${skill}`) || skill}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.aiBox}>
        <Text style={styles.aiRobot}>🤖</Text>
        <Text style={styles.aiText}>
          AI suggests:{" "}
          <Text style={styles.aiBold}>
            {AI_SUGGESTED.join(", ")}
          </Text>{" "}
          based on your profile.
        </Text>
      </View>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  skillGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  skillCard: {
    width: "31%",
    minWidth: 100,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  skillCardSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  skillIcon: { fontSize: 22, marginBottom: 6 },
  skillName: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
  },
  skillNameSelected: { color: COLORS.primary },
  aiBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.md,
    padding: 14,
    gap: 10,
    marginBottom: 8,
  },
  aiRobot: { fontSize: 18 },
  aiText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.primary,
    lineHeight: 20,
  },
  aiBold: { fontWeight: "700" },
});
