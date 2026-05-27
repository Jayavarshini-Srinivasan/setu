import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { useOnboarding } from "../../context/OnboardingContext";
import { useI18n } from "../../context/I18nContext";
import OnboardingStepLayout from "../../components/OnboardingStepLayout";
import { COLORS } from "../../constants/theme";


export default function ProfessionalExperienceScreen({
  navigation,
}) {

  /*
    CONTEXT
  */
  const {
    onboardingData,

    updateField,
  } = useOnboarding();
  const { t } = useI18n();

  /*
    LOCAL STATE
  */
  const [
    company,
    setCompany,
  ] = useState("");

  const [
    role,
    setRole,
  ] = useState("");

  const [
    years,
    setYears,
  ] = useState("");

  const [
    achievements,
    setAchievements,
  ] = useState("");

  /*
    EXISTING EXPERIENCE
  */
  const existingExperience =
    onboardingData.experienceDetails || [];

  const canAddExperience =
    Boolean(company.trim()) &&
    Boolean(role.trim()) &&
    Boolean(years.trim()) &&
    Boolean(achievements.trim());

  const canContinue = existingExperience.length > 0;

  /*
    ADD EXPERIENCE
  */
  const handleAddExperience =
    () => {

      if (
        !canAddExperience
      ) {

        Alert.alert(
          t("required") || "Required",
          t("experienceOnboarding.completeAllFieldsError") || "Please complete all required fields"
        );

        return;
      }

      const newExperience = {

        company: company.trim(),

        role: role.trim(),

        years: years.trim(),

        achievements: achievements.trim(),
      };

      const updatedExperience = [

        ...existingExperience,

        newExperience,
      ];

      /*
        SAVE
      */
      updateField(
        "experienceDetails",
        updatedExperience
      );

      /*
        RESET INPUTS
      */
      setCompany("");

      setRole("");

      setYears("");

      setAchievements("");

      Alert.alert(
        t("added") || "Added",
        t("experienceOnboarding.experienceAddedSuccess") || "Experience added successfully"
      );
    };

  /*
    CONTINUE
  */
  const handleContinue =
    () => {

      if (
        existingExperience.length === 0
      ) {

        Alert.alert(
          t("required") || "Required",
          t("experienceOnboarding.addExperienceError") || "Please add at least one experience"
        );

        return;
      }

      navigation.navigate(
        "ProfessionalLinks"
      );
    };

  return (
    <OnboardingStepLayout
      navigation={navigation}
      screenTitle="Experience (4/4)"
      step={4}
      badge="PROFESSIONAL"
      title={t("experienceOnboarding.title") || "Add your work experience"}
      subtitle={t("experienceOnboarding.subtitle") || "This helps generate professional resumes and career insights."}
      onContinue={handleContinue}
      continueDisabled={!canContinue}
    >

      <TextInput
        style={styles.input}

        placeholder={t("experienceOnboarding.companyPlaceholder") || "Company"}

        value={company}

        onChangeText={setCompany}
      />

      <TextInput
        style={styles.input}

        placeholder={t("experienceOnboarding.rolePlaceholder") || "Role"}

        value={role}

        onChangeText={setRole}
      />

      <TextInput
        style={styles.input}

        placeholder={t("experienceOnboarding.yearsPlaceholder") || "Years of Experience"}

        keyboardType="numeric"

        value={years}

        onChangeText={setYears}
      />

      <TextInput
        style={[
          styles.input,
          styles.textArea,
        ]}

        placeholder={t("experienceOnboarding.achievementsPlaceholder") || "Key achievements"}

        multiline

        numberOfLines={5}

        value={achievements}

        onChangeText={setAchievements}
      />

      <TouchableOpacity
        style={[styles.addButton, !canAddExperience && styles.addButtonDisabled]}

        onPress={handleAddExperience}

        disabled={!canAddExperience}
      >

        <Text style={styles.buttonText}>
          {t("experienceOnboarding.addButtonLabel") || "Add Experience"}
        </Text>

      </TouchableOpacity>

      {/* EXPERIENCE LIST */}

      {
        existingExperience.map(
          (
            item,
            index
          ) => (

            <View
              key={index}

              style={styles.experienceCard}
            >

              <Text style={styles.cardTitle}>
                {item.role}
              </Text>

              <Text style={styles.cardSubtitle}>
                {item.company}
              </Text>

              <Text style={styles.cardText}>
                {item.years} {t("experienceOnboarding.yearsSuffix") || "years"}
              </Text>

              {
                item.achievements ? (
                  <Text style={styles.cardText}>
                    {item.achievements}
                  </Text>
                ) : null
              }

            </View>
          )
        )
      }

    </OnboardingStepLayout>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flexGrow: 1,

      backgroundColor:
        COLORS.background,

      padding: 24,
    },

    title: {
      fontSize: 30,

      fontWeight: "bold",

      marginTop: 50,

      marginBottom: 12,
    },

    subtitle: {
      fontSize: 16,

      color: "#666",

      marginBottom: 30,
    },

    input: {
      borderWidth: 1,

      borderColor:
        "#ddd",

      borderRadius: 14,

      padding: 18,

      fontSize: 16,

      marginBottom: 18,
    },

    textArea: {
      height: 120,

      textAlignVertical:
        "top",
    },

    addButton: {
      backgroundColor:
        COLORS.primary,

      padding: 18,

      borderRadius: 16,

      alignItems:
        "center",

      marginBottom: 30,
    },

    addButtonDisabled: {
      backgroundColor:
        "#D1D5DB",
    },

    continueButton: {
      backgroundColor:
        COLORS.primary,

      padding: 20,

      borderRadius: 16,

      alignItems:
        "center",

      marginTop: 20,

      marginBottom: 40,
    },

    buttonText: {
      color: "#fff",

      fontSize: 18,

      fontWeight: "bold",
    },

    experienceCard: {
      backgroundColor:
        "#F8FAFC",

      padding: 18,

      borderRadius: 16,

      marginBottom: 16,
    },

    cardTitle: {
      fontSize: 20,

      fontWeight: "bold",

      marginBottom: 4,
    },

    cardSubtitle: {
      fontSize: 16,

      color: "#555",

      marginBottom: 8,
    },

    cardText: {
      fontSize: 15,

      color: "#333",
    },
  });
