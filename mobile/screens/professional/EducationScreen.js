import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useOnboarding } from "../../context/OnboardingContext";
import { useI18n } from "../../context/I18nContext";
import OnboardingStepLayout, { onboardingStyles as os } from "../../components/OnboardingStepLayout";
import { COLORS, BORDER_RADIUS } from "../../constants/theme";

const DEGREES = ["B.Com", "BBA", "B.Tech", "B.Sc", "MBA", "M.Com", "Diploma", "Other"];
const GRAD_YEARS = ["2020", "2021", "2022", "2023", "2024"];

export default function EducationScreen({ navigation }) {
  const { onboardingData, updateField } = useOnboarding();
  const { t } = useI18n();

  const [degree, setDegree] = useState(onboardingData.education?.degree || "B.Com");
  const [institution, setInstitution] = useState(onboardingData.education?.institution || "");
  const [graduationYear, setGraduationYear] = useState(
    onboardingData.education?.graduationYear || "2022"
  );
  const [fieldOfStudy, setFieldOfStudy] = useState(
    onboardingData.education?.fieldOfStudy || ""
  );
  const [certifications, setCertifications] = useState(
    (onboardingData.certifications || []).join(", ")
  );
  const [showDegreePicker, setShowDegreePicker] = useState(false);

  const handleContinue = () => {
    if (!degree || !institution || !graduationYear) {
      Alert.alert(
        t("required") || "Required",
        t("educationOnboarding.completeAllFieldsError") || "Please complete all education fields"
      );
      return;
    }

    updateField("education", {
      degree,
      institution,
      graduationYear,
      fieldOfStudy,
    });

    if (certifications.trim()) {
      updateField(
        "certifications",
        certifications.split(",").map((c) => c.trim()).filter(Boolean)
      );
    }

    navigation.navigate("ProfessionalSkills");
  };

  return (
    <OnboardingStepLayout
      navigation={navigation}
      screenTitle="Education (3/4)"
      step={3}
      title="Education"
      subtitle={
        t("educationOnboarding.subtitle") ||
        "Your educational background helps us match you better."
      }
      onContinue={handleContinue}
    >
      <Text style={os.label}>HIGHEST DEGREE</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setShowDegreePicker(!showDegreePicker)}
        activeOpacity={0.8}
      >
        <Text style={styles.dropdownText}>{degree}</Text>
        <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
      {showDegreePicker && (
        <View style={styles.pickerList}>
          {DEGREES.map((d) => (
            <TouchableOpacity
              key={d}
              style={styles.pickerItem}
              onPress={() => {
                setDegree(d);
                setShowDegreePicker(false);
              }}
            >
              <Text style={styles.pickerItemText}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={os.inputRow}>
        <Ionicons name="business-outline" size={20} color={COLORS.textLight} style={os.inputIcon} />
        <TextInput
          style={os.inputFlex}
          placeholder={t("educationOnboarding.institutionPlaceholder") || "Institution / College name"}
          placeholderTextColor={COLORS.textLight}
          value={institution}
          onChangeText={setInstitution}
        />
      </View>

      <Text style={os.label}>GRADUATION YEAR</Text>
      <View style={os.chipRow}>
        {GRAD_YEARS.map((y) => (
          <TouchableOpacity
            key={y}
            style={[os.chip, graduationYear === y && os.chipSelected]}
            onPress={() => setGraduationYear(y)}
          >
            <Text style={[os.chipText, graduationYear === y && os.chipTextSelected]}>{y}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={os.inputRow}>
        <Text style={styles.fieldIcon}>🎨</Text>
        <TextInput
          style={os.inputFlex}
          placeholder="Field of study / Specialization"
          placeholderTextColor={COLORS.textLight}
          value={fieldOfStudy}
          onChangeText={setFieldOfStudy}
        />
      </View>

      <View style={os.tipBox}>
        <Text style={styles.tipIcon}>✏️</Text>
        <Text style={os.tipText}>
          Add certifications — they boost your match score significantly!
        </Text>
      </View>

      <View style={os.inputRow}>
        <Text style={styles.fieldIcon}>🏆</Text>
        <TextInput
          style={os.inputFlex}
          placeholder="Certifications (optional)"
          placeholderTextColor={COLORS.textLight}
          value={certifications}
          onChangeText={setCertifications}
        />
      </View>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  pickerList: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 8,
    overflow: "hidden",
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerItemText: { fontSize: 16, color: COLORS.text },
  fieldIcon: { fontSize: 18, marginRight: 10 },
  tipIcon: { fontSize: 16 },
});
