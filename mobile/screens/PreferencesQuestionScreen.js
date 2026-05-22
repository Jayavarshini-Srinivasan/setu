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
} from "../context/OnboardingContext";
import { useI18n } from "../context/I18nContext";

export default function PreferencesQuestionScreen({
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
    AVAILABILITY
  */
  const [
    availability,
    setAvailability,
  ] = useState(
    onboardingData
      .availability || ""
  );

  /*
    SHIFT
  */
  const [
    preferredShift,
    setPreferredShift,
  ] = useState(
    onboardingData
      .preferredShift || ""
  );

  /*
    OPTIONS
  */
  const availabilityOptions = [
    "full-time",
    "part-time",
    "contract",
  ];

  const shiftOptions = [
    "day",
    "night",
    "flexible",
  ];

  /*
    CONTINUE
  */
  const handleContinue =
    () => {

      if (
        !availability ||
        !preferredShift
      ) {

        Alert.alert(
          "Required",
          "Please complete all preferences"
        );

        return;
      }

      /*
        SAVE
      */
      updateField(
        "availability",
        availability
      );

      updateField(
        "preferredShift",
        preferredShift
      );

      /*
        NEXT
      */
      navigation.navigate(
        "ContactQuestion"
      );
    };

  return (

    <ScrollView
      contentContainerStyle={
        styles.container
      }
    >

      {/* PROGRESS BAR */}
      <View style={styles.progressContainer}>
        {Array.from({ length: 5 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressSegment,
              index + 1 <= 5 ? styles.progressActive : styles.progressInactive,
            ]}
          />
        ))}
      </View>

      {/* TITLE */}

      <Text
        style={
          styles.title
        }
      >
        {t("workPreferences") || "Work Preferences"}
      </Text>

      <Text
        style={
          styles.subtitle
        }
      >
        {t("workPrefSubtitle") || "Select your preferred work type and shift."}
      </Text>

      {/* AVAILABILITY */}

      <Text
        style={
          styles.sectionTitle
        }
      >
        {t("availability") || "Availability"}
      </Text>

      <View
        style={
          styles.optionsContainer
        }
      >

        {
          availabilityOptions.map(
            (option) => {

              const isSelected =
                availability ===
                option;

              return (

                <TouchableOpacity
                  key={option}

                  style={[
                    styles.optionChip,

                    isSelected &&
                      styles.selectedChip,
                  ]}

                  onPress={() =>
                    setAvailability(
                      option
                    )
                  }
                >

                  <Text
                    style={[
                      styles.optionText,

                      isSelected &&
                        styles.selectedText,
                    ]}
                  >
                    {t(`availabilityOptions.${option}`) || option}
                  </Text>

                </TouchableOpacity>
              );
            }
          )
        }

      </View>

      {/* SHIFT */}

      <Text
        style={
          styles.sectionTitle
        }
      >
        {t("preferredShift") || "Preferred Shift"}
      </Text>

      <View
        style={
          styles.optionsContainer
        }
      >

        {
          shiftOptions.map(
            (option) => {

              const isSelected =
                preferredShift ===
                option;

              return (

                <TouchableOpacity
                  key={option}

                  style={[
                    styles.optionChip,

                    isSelected &&
                      styles.selectedChip,
                  ]}

                  onPress={() =>
                    setPreferredShift(
                      option
                    )
                  }
                >

                  <Text
                    style={[
                      styles.optionText,

                      isSelected &&
                        styles.selectedText,
                    ]}
                  >
                    {t(`shiftOptions.${option}`) || option}
                  </Text>

                </TouchableOpacity>
              );
            }
          )
        }

      </View>

      {/* CONTINUE */}

      <TouchableOpacity
        style={
          styles.continueButton
        }

        onPress={
          handleContinue
        }
      >

        <Text
          style={
            styles.continueText
          }
        >
          {t("continue") || "Continue"}
        </Text>

      </TouchableOpacity>

    </ScrollView>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flexGrow: 1,
      padding: 24,
      paddingTop: 40,
      justifyContent: "flex-start",
      backgroundColor: "#F7F5F2",
    },

    progressContainer: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 30,
    },

    progressSegment: {
      flex: 1,
      height: 4,
      borderRadius: 2,
    },

    progressActive: {
      backgroundColor: "#E85D26",
    },

    progressInactive: {
      backgroundColor: "rgba(26,26,46,0.12)",
    },

    title: {
      fontSize: 30,

      fontWeight: "bold",

      marginBottom: 12,
    },

    subtitle: {
      fontSize: 16,

      color: "#666",

      marginBottom: 40,
    },

    sectionTitle: {
      fontSize: 20,

      fontWeight: "600",

      marginBottom: 16,

      marginTop: 10,
    },

    optionsContainer: {
      flexDirection: "row",

      flexWrap: "wrap",

      gap: 12,

      marginBottom: 30,
    },

    optionChip: {
      borderWidth: 1,

      borderColor:
        "#ccc",

      borderRadius: 30,

      paddingVertical: 12,

      paddingHorizontal: 18,
    },

    selectedChip: {
      backgroundColor:
        "#2980b9",

      borderColor:
        "#2980b9",
    },

    optionText: {
      fontSize: 16,
    },

    selectedText: {
      color: "#fff",

      fontWeight: "bold",
    },

    continueButton: {
      backgroundColor:
        "#000",

      padding: 18,

      borderRadius: 16,

      alignItems:
        "center",

      marginTop: 20,
    },

    continueText: {
      color: "#fff",

      fontSize: 18,

      fontWeight: "bold",
    },
  });