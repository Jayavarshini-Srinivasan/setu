import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";

import { useOnboarding } from "../context/OnboardingContext";
import { useI18n } from "../context/I18nContext";
import OnboardingStepLayout, { onboardingStyles as os } from "../components/OnboardingStepLayout";
import { COLORS } from "../constants/theme";

export default function PreferencesQuestionScreen({ navigation }) {
  const { onboardingData, updateField } = useOnboarding();
  const { t } = useI18n();

  const [preferredShift, setPreferredShift] = useState(
    onboardingData.preferredShift || "day"
  );

  const shiftOptions = ["day", "night", "flexible"];

  const handleContinue = () => {
    if (!preferredShift) {
      Alert.alert("Required", "Please select your preferred shift.");
      return;
    }
    updateField("preferredShift", preferredShift);
    navigation.navigate("ContactQuestion");
  };

  return (
    <OnboardingStepLayout
      navigation={navigation}
      screenTitle="Preferences"
      step={4}
      title={t("workPreferences") || "Work Preferences"}
      subtitle={t("workPrefSubtitle") || "Select your preferred shift."}
      onContinue={handleContinue}
      variant="labour"
    >
      <Text style={os.label}>PREFERRED SHIFT</Text>
      <View style={os.chipRow}>
        {shiftOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[os.chip, preferredShift === option && os.chipSelectedLabour]}
            onPress={() => setPreferredShift(option)}
          >
            <Text style={[os.chipText, preferredShift === option && os.chipTextSelected]}>
              {t(`shiftOptions.${option}`) || option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </OnboardingStepLayout>
  );
}
