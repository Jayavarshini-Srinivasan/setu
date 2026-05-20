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

export default function ProfessionalSkillsScreen({
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
    AVAILABLE SKILLS
  */
  const availableSkills = [

    "JavaScript",

    "React",

    "React Native",

    "Node.js",

    "Python",

    "SQL",

    "UI Design",

    "Figma",

    "Data Analysis",

    "Machine Learning",

    "Communication",

    "Leadership",

    "Project Management",

    "Marketing",

    "Excel",

    "Firebase",

    "Git",

    "API Development",
  ];

  /*
    LOCAL STATE
  */
  const [
    selectedSkills,
    setSelectedSkills,
  ] = useState(
    onboardingData.professionalSkills || []
  );

  /*
    TOGGLE SKILL
  */
  const toggleSkill =
    (skill) => {

      let updatedSkills = [];

      /*
        REMOVE
      */
      if (
        selectedSkills.includes(
          skill
        )
      ) {

        updatedSkills =
          selectedSkills.filter(
            (item) =>
              item !== skill
          );

      } else {

        /*
          ADD
        */
        updatedSkills = [
          ...selectedSkills,
          skill,
        ];
      }

      setSelectedSkills(
        updatedSkills
      );

      updateField(
        "professionalSkills",
        updatedSkills
      );
    };

  /*
    CONTINUE
  */
  const handleContinue =
    () => {

      if (
        selectedSkills.length === 0
      ) {

        Alert.alert(
          t("required") || "Required",
          t("selectSkillsError") || "Please select at least one skill"
        );

        return;
      }

      navigation.navigate(
        "ProfessionalExperience"
      );
    };

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        {t("selectProfessionalSkills") || "Select your professional skills"}
      </Text>

      <Text style={styles.subtitle}>
        {t("skillsImproveMatching") || "These skills improve job matching and AI recommendations."}
      </Text>

      <ScrollView
        contentContainerStyle={
          styles.skillsContainer
        }
      >

        {
          availableSkills.map(
            (skill) => {

              const isSelected =
                selectedSkills.includes(
                  skill
                );

              return (

                <TouchableOpacity
                  key={skill}

                  style={[

                    styles.skillChip,

                    isSelected &&
                      styles.selectedChip,
                  ]}

                  onPress={() =>
                    toggleSkill(
                      skill
                    )
                  }
                >

                  <Text
                    style={[
                      styles.skillText,
                      isSelected && styles.selectedText,
                    ]}
                  >
                    {t(`skills.${skill}`) || skill}
                  </Text>

                </TouchableOpacity>
              );
            }
          )
        }

      </ScrollView>

      <TouchableOpacity
        style={styles.button}

        onPress={handleContinue}
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

    skillsContainer: {
      flexDirection: "row",

      flexWrap: "wrap",

      gap: 12,

      paddingBottom: 40,
    },

    skillChip: {
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

    skillText: {
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

    buttonText: {
      color: "#fff",

      fontSize: 18,

      fontWeight: "bold",
    },
  });