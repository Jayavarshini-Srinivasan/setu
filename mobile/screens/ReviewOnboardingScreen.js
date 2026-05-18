// screens/ReviewOnboardingScreen.js

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";

import {
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  db,
  auth,
} from "../services/firebase";

import {
  useOnboarding,
} from "../context/OnboardingContext";

export default function ReviewOnboardingScreen({
  navigation,
}) {

  const {
    onboardingData,

    resetOnboarding,

    refreshOnboarding,
  } = useOnboarding();

  /*
    COMPLETE
  */
  const handleComplete =
    async () => {

      try {

        const uid =
          auth.currentUser.uid;

        const userRef =
          doc(
            db,
            "users",
            uid
          );

        await updateDoc(
          userRef,
          {

            workerType:
              "labour",

            onboardingCompleted:
              true,

            profile: {

              role:
                onboardingData.role,

              canonicalRole:
                onboardingData
                  .canonicalRole,

              skills:
                onboardingData.skills,

              experience:
                onboardingData
                  .experience,

              location:
                onboardingData
                  .location,

              labourData: {

                availability:
                  onboardingData
                    .availability,

                preferredShift:
                  onboardingData
                    .preferredShift,
              },

              transcriptHistory:
                onboardingData
                  .transcriptHistory,
            },
          }
        );

        /*
          REFRESH APP STATE
        */
        refreshOnboarding();

        /*
          RESET
        */
        resetOnboarding();

        Alert.alert(
          "Success",
          "Onboarding completed successfully"
        );

      } catch (error) {

        console.log(error);

        Alert.alert(
          "Error",
          "Failed to complete onboarding"
        );
      }
    };

  return (

    <ScrollView
      contentContainerStyle={
        styles.container
      }
    >

      <Text style={styles.title}>
        Review Your Profile
      </Text>

      <Text style={styles.subtitle}>
        Confirm your details before continuing.
      </Text>

      <View style={styles.card}>

        <Text style={styles.label}>
          Role
        </Text>

        <Text style={styles.value}>
          {
            onboardingData
              .canonicalRole
          }
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.label}>
          Skills
        </Text>

        <Text style={styles.value}>
          {
            (
              onboardingData.skills || []
            ).join(", ")
          }
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.label}>
          Experience
        </Text>

        <Text style={styles.value}>
          {
            onboardingData
              .experience
          } years
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.label}>
          Location
        </Text>

        <Text style={styles.value}>
          {
            onboardingData
              .location
          }
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.label}>
          Availability
        </Text>

        <Text style={styles.value}>
          {
            onboardingData
              .availability
          }
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.label}>
          Preferred Shift
        </Text>

        <Text style={styles.value}>
          {
            onboardingData
              .preferredShift
          }
        </Text>

      </View>

      <TouchableOpacity
        style={
          styles.completeButton
        }

        onPress={
          handleComplete
        }
      >

        <Text
          style={
            styles.completeText
          }
        >
          Complete Onboarding
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

      backgroundColor:
        "#fff",
    },

    title: {
      fontSize: 30,

      fontWeight: "bold",

      marginBottom: 12,

      marginTop: 30,
    },

    subtitle: {
      fontSize: 16,

      color: "#666",

      marginBottom: 30,
    },

    card: {
      backgroundColor:
        "#f8f9fa",

      padding: 18,

      borderRadius: 16,

      marginBottom: 16,
    },

    label: {
      fontSize: 14,

      color: "#777",

      marginBottom: 8,
    },

    value: {
      fontSize: 18,

      fontWeight: "600",
    },

    completeButton: {
      backgroundColor:
        "#000",

      padding: 20,

      borderRadius: 16,

      alignItems:
        "center",

      marginTop: 30,

      marginBottom: 40,
    },

    completeText: {
      color: "#fff",

      fontSize: 18,

      fontWeight: "bold",
    },
  });