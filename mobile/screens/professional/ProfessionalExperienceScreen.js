import {
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";

import {
  useOnboarding,
} from "../../context/OnboardingContext";

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

  /*
    ADD EXPERIENCE
  */
  const handleAddExperience =
    () => {

      if (
        !company ||
        !role ||
        !years
      ) {

        Alert.alert(
          "Required",
          "Please complete all required fields"
        );

        return;
      }

      const newExperience = {

        company,

        role,

        years,

        achievements,
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
        "Added",
        "Experience added successfully"
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
          "Required",
          "Please add at least one experience"
        );

        return;
      }

      navigation.navigate(
        "ProfessionalLinks"
      );
    };

  return (

    <ScrollView
      contentContainerStyle={
        styles.container
      }
    >

      <Text style={styles.title}>
        Add your work experience
      </Text>

      <Text style={styles.subtitle}>
        This helps generate professional resumes and career insights.
      </Text>

      <TextInput
        style={styles.input}

        placeholder="Company"

        value={company}

        onChangeText={setCompany}
      />

      <TextInput
        style={styles.input}

        placeholder="Role"

        value={role}

        onChangeText={setRole}
      />

      <TextInput
        style={styles.input}

        placeholder="Years of Experience"

        keyboardType="numeric"

        value={years}

        onChangeText={setYears}
      />

      <TextInput
        style={[
          styles.input,
          styles.textArea,
        ]}

        placeholder="Key achievements"

        multiline

        numberOfLines={5}

        value={achievements}

        onChangeText={setAchievements}
      />

      <TouchableOpacity
        style={styles.addButton}

        onPress={handleAddExperience}
      >

        <Text style={styles.buttonText}>
          Add Experience
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
                {item.years} years
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

      <TouchableOpacity
        style={styles.continueButton}

        onPress={handleContinue}
      >

        <Text style={styles.buttonText}>
          Continue
        </Text>

      </TouchableOpacity>

    </ScrollView>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flexGrow: 1,

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
        "#2563EB",

      padding: 18,

      borderRadius: 16,

      alignItems:
        "center",

      marginBottom: 30,
    },

    continueButton: {
      backgroundColor:
        "#000",

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