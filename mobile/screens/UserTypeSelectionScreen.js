import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import {
  useOnboarding,
} from "../context/OnboardingContext";

export default function UserTypeSelectionScreen({
  navigation,
}) {

  const {
    updateField,
  } = useOnboarding();

  /*
    LABOUR FLOW
  */
  const handleLabour =
    () => {

      updateField(
        "workerType",
        "labour"
      );

      navigation.navigate(
        "RoleQuestion"
      );
    };

  /*
    PROFESSIONAL FLOW
  */
  const handleProfessional =
    () => {

      updateField(
        "workerType",
        "professional"
      );

      navigation.navigate(
        "ProfessionalRole"
      );
    };

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Welcome to Setu
      </Text>

      <Text style={styles.subtitle}>
        Choose the path that best describes you.
      </Text>

      <TouchableOpacity
        style={styles.button}

        onPress={handleLabour}
      >

        <Text style={styles.buttonText}>
          Labour Worker
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}

        onPress={handleProfessional}
      >

        <Text style={styles.buttonText}>
          Professional
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

      justifyContent:
        "center",

      padding: 24,
    },

    title: {
      fontSize: 34,

      fontWeight: "bold",

      marginBottom: 12,
    },

    subtitle: {
      fontSize: 16,

      color: "#666",

      marginBottom: 40,
    },

    button: {
      backgroundColor:
        "#000",

      padding: 22,

      borderRadius: 18,

      alignItems:
        "center",

      marginBottom: 20,
    },

    buttonText: {
      color: "#fff",

      fontSize: 18,

      fontWeight: "bold",
    },
  });