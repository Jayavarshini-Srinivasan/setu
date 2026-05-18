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
} from "react-native";

import {
  useOnboarding,
} from "../../context/OnboardingContext";

export default function EducationScreen({
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
    degree,
    setDegree,
  ] = useState(
    onboardingData.education?.degree || ""
  );

  const [
    institution,
    setInstitution,
  ] = useState(
    onboardingData.education?.institution || ""
  );

  const [
    graduationYear,
    setGraduationYear,
  ] = useState(
    onboardingData.education?.graduationYear || ""
  );

  /*
    CONTINUE
  */
  const handleContinue =
    () => {

      if (
        !degree ||
        !institution ||
        !graduationYear
      ) {

        Alert.alert(
          "Required",
          "Please complete all education fields"
        );

        return;
      }

      /*
        SAVE EDUCATION
      */
      updateField(
        "education",
        {

          degree,

          institution,

          graduationYear,
        }
      );

      navigation.navigate(
        "ProfessionalSkills"
      );
    };

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Tell us about your education
      </Text>

      <Text style={styles.subtitle}>
        This helps build your resume and career recommendations.
      </Text>

      <TextInput
        style={styles.input}

        placeholder="Degree"

        value={degree}

        onChangeText={setDegree}
      />

      <TextInput
        style={styles.input}

        placeholder="Institution"

        value={institution}

        onChangeText={setInstitution}
      />

      <TextInput
        style={styles.input}

        placeholder="Graduation Year"

        keyboardType="numeric"

        value={graduationYear}

        onChangeText={setGraduationYear}
      />

      <TouchableOpacity
        style={styles.button}

        onPress={handleContinue}
      >

        <Text style={styles.buttonText}>
          Continue
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

      justifyContent:
        "center",
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

    input: {
      borderWidth: 1,

      borderColor:
        "#ddd",

      borderRadius: 14,

      padding: 18,

      fontSize: 16,

      marginBottom: 20,
    },

    button: {
      backgroundColor:
        "#000",

      padding: 20,

      borderRadius: 16,

      alignItems:
        "center",

      marginTop: 10,
    },

    buttonText: {
      color: "#fff",

      fontSize: 18,

      fontWeight: "bold",
    },
  });