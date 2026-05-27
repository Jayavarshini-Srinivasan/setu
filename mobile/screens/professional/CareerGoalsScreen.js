import {
  useState,
} from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";

import {
  useOnboarding,
} from "../../context/OnboardingContext";
import { useI18n } from "../../context/I18nContext";

export default function CareerGoalsScreen({
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
    GOAL OPTIONS
  */
  const goalOptions = [

    "Get my first job",

    "Switch careers",

    "Become a senior professional",

    "Increase salary",

    "Work at a top company",

    "Improve technical skills",

    "Become a manager",

    "Work remotely",

    "Build my portfolio",

    "Get international opportunities",
  ];

  /*
    LOCAL STATE
  */
  const [
    selectedGoals,
    setSelectedGoals,
  ] = useState(
    onboardingData.preferredRoles || []
  );

  /*
    TOGGLE GOAL
  */
  const toggleGoal =
    (goal) => {

      let updatedGoals = [];

      /*
        REMOVE
      */
      if (
        selectedGoals.includes(
          goal
        )
      ) {

        updatedGoals =
          selectedGoals.filter(
            (item) =>
              item !== goal
          );

      } else {

        /*
          ADD
        */
        updatedGoals = [

          ...selectedGoals,

          goal,
        ];
      }

      setSelectedGoals(
        updatedGoals
      );

      updateField(
        "preferredRoles",
        updatedGoals
      );
    };

  /*
    CONTINUE
  */
  const handleContinue =
    () => {

      if (!isFormValid) {
        Alert.alert(
          t("required") || "Required",
          t("selectCareerGoalError") || "Please select at least one career goal"
        );

        return;
      }

      navigation.navigate(
        "ContactQuestion"
      );
    };

  const isFormValid = selectedGoals.length > 0;

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        {t("careerGoalsTitle") || "What are your career goals?"}
      </Text>

      <Text style={styles.subtitle}>
        {t("careerGoalsSubtitle") || "This helps Setu personalize learning paths and job recommendations."}
      </Text>

      <ScrollView
        contentContainerStyle={
          styles.goalsContainer
        }
      >

        {
          goalOptions.map(
            (goal) => {

              const isSelected =
                selectedGoals.includes(
                  goal
                );

              return (

                <TouchableOpacity
                  key={goal}

                  style={[

                    styles.goalChip,

                    isSelected &&
                      styles.selectedChip,
                  ]}

                  onPress={() =>
                    toggleGoal(
                      goal
                    )
                  }
                >

                  <Text
                    style={[

                      styles.goalText,

                      isSelected &&
                        styles.selectedText,
                    ]}
                  >
                    {t(`goals.${goal.replace(/\s+/g, '_')}`) || goal}
                  </Text>

                </TouchableOpacity>
              );
            }
          )
        }

      </ScrollView>

      <TouchableOpacity
        style={[styles.button, !isFormValid && styles.buttonDisabled]}

        onPress={handleContinue}

        disabled={!isFormValid}
      >

        <Text style={styles.buttonText}>
          {t("continue") || "Continue"}
        </Text>

      </TouchableOpacity>

    </View>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,

      backgroundColor:
        "#fff",

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

    goalsContainer: {
      flexDirection: "row",

      flexWrap: "wrap",

      gap: 12,

      paddingBottom: 40,
    },

    goalChip: {
      borderWidth: 1,

      borderColor:
        "#ccc",

      borderRadius: 30,

      paddingVertical: 14,

      paddingHorizontal: 18,
    },

    selectedChip: {
      backgroundColor:
        "#2563EB",

      borderColor:
        "#2563EB",
    },

    goalText: {
      fontSize: 16,
    },

    selectedText: {
      color: "#fff",

      fontWeight: "bold",
    },

    button: {
      backgroundColor:
        "#000",

      padding: 20,

      borderRadius: 16,

      alignItems:
        "center",

      marginBottom: 30,
    },

    buttonDisabled: {
      backgroundColor:
        "#D1D5DB",
    },

    buttonText: {
      color: "#fff",

      fontSize: 18,

      fontWeight: "bold",
    },
  });
