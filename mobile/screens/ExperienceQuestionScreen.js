import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";

import { useOnboarding } from "../context/OnboardingContext";
import { useI18n } from "../context/I18nContext";
import OnboardingStepLayout, { onboardingStyles as os } from "../components/OnboardingStepLayout";
import { COLORS } from "../constants/theme";

const EXP_OPTIONS = [
  { label: "No exp", value: 0 },
  { label: "1-2 yr", value: 2 },
  { label: "3-5 yr", value: 4 },
  { label: "5+ yr", value: 6 },
];

const AVAILABILITY_OPTIONS = [
  { label: "Full time", value: "full-time" },
  { label: "Part time", value: "part-time" },
  { label: "Contract", value: "contract" },
];

const WAGE_OPTIONS = [
  { label: "< 300", value: "<300" },
  { label: "300-600", value: "300-600" },
  { label: "600-1000", value: "600-1000" },
  { label: "1000+", value: "1000+" },
];

export default function ExperienceQuestionScreen({ navigation }) {
  const { onboardingData, updateField } = useOnboarding();
  const { t } = useI18n();

  const [expBand, setExpBand] = useState(
    EXP_OPTIONS.find((o) => o.value === Number(onboardingData.experience))?.label || "1-2 yr"
  );
  const [availability, setAvailability] = useState(onboardingData.availability || "full-time");
  const [wage, setWage] = useState(onboardingData.expectedWage || "300-600");
  const [previousWork, setPreviousWork] = useState(onboardingData.previousWorkType || "");

  const handleContinue = () => {
    const expVal = EXP_OPTIONS.find((o) => o.label === expBand)?.value ?? 0;
    if (!availability) {
      Alert.alert("Required", "Please select your availability.");
      return;
    }

    updateField("experience", expVal);
    updateField("availability", availability);
    updateField("expectedWage", wage);
    if (previousWork.trim()) {
      updateField("previousWorkType", previousWork.trim());
    }
    navigation.navigate("LocationQuestion");
  };

  return (
    <OnboardingStepLayout
      navigation={navigation}
      screenTitle="Experience (3/4)"
      step={3}
      title="Experience & Availability"
      subtitle={t("experienceSubtitle") || "Tell us about your work history and preferences."}
      onContinue={handleContinue}
      variant="labour"
    >
      <Text style={os.label}>YEARS OF EXPERIENCE</Text>
      <View style={os.chipRow}>
        {EXP_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.label}
            style={[os.chip, expBand === opt.label && os.chipSelectedLabour]}
            onPress={() => {
              setExpBand(opt.label);
              updateField("experience", opt.value);
            }}
          >
            <Text style={[os.chipText, expBand === opt.label && os.chipTextSelected]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={os.label}>AVAILABILITY</Text>
      <View style={os.chipRow}>
        {AVAILABILITY_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[os.chip, availability === opt.value && os.chipSelectedLabour]}
            onPress={() => setAvailability(opt.value)}
          >
            <Text style={[os.chipText, availability === opt.value && os.chipTextSelected]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={os.label}>EXPECTED DAILY WAGE (₹)</Text>
      <View style={os.chipRow}>
        {WAGE_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[os.chip, wage === opt.value && os.chipSelectedLabour]}
            onPress={() => setWage(opt.value)}
          >
            <Text style={[os.chipText, wage === opt.value && os.chipTextSelected]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={os.label}>PREVIOUS WORK TYPE</Text>
      <TextInput
        style={styles.textArea}
        placeholder="e.g. Construction, domestic, factory..."
        placeholderTextColor={COLORS.textLight}
        value={previousWork}
        onChangeText={setPreviousWork}
        multiline
      />
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  textArea: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 80,
    textAlignVertical: "top",
  },
});
