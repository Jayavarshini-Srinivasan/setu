

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
import { useI18n } from "../context/I18nContext";

export default function ReviewOnboardingScreen({
  navigation,
}) {

  const {
    onboardingData,

    resetOnboarding,

    refreshOnboarding,
  } = useOnboarding();

  const { t } = useI18n();

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

              phoneNumber:
                onboardingData
                  .phoneNumber || "",

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
          REFRESH APP STATE — triggers App.js to navigate to LabourTabs
        */
        refreshOnboarding();
        resetOnboarding();

      } catch (error) {

        console.log(error);

        Alert.alert(
          "Error",
          "Failed to complete onboarding. Please try again."
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
        {t("reviewProfile") || "Review Your Profile"}
      </Text>

      <Text style={styles.subtitle}>
        {t("confirmDetails") || "Confirm your details before continuing."}
      </Text>

      <View style={styles.card}>

        <Text style={styles.label}>
          {t("roleLabel") || "Role"}
        </Text>

        <Text style={styles.value}>
          {
            t("roles." + onboardingData.canonicalRole) || onboardingData.canonicalRole
          }
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.label}>
          {t("skillsLabel") || "Skills"}
        </Text>

        <Text style={styles.value}>
          {
            (
              onboardingData.skills || []
            ).map(s => t("skills." + s) || s).join(", ")
          }
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.label}>
          {t("experienceLabel") || "Experience"}
        </Text>

        <Text style={styles.value}>
          {
            onboardingData
              .experience
          } {t("years") || "years"}
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.label}>
          {t("locationLabel") || "Location"}
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
          {t("availability") || "Availability"}
        </Text>

        <Text style={styles.value}>
          {
            t("availabilityOptions." + onboardingData.availability) || onboardingData.availability
          }
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.label}>
          {t("preferredShift") || "Preferred Shift"}
        </Text>

        <Text style={styles.value}>
          {
            t("shiftOptions." + onboardingData.preferredShift) || onboardingData.preferredShift
          }
        </Text>
      </View>
      <View style={styles.card}>

        <Text style={styles.label}>
          {t("phonePrompt") || "Phone Number"}
        </Text>

        <Text style={styles.value}>
          {
            onboardingData.phoneNumber || "—"
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
          {t("completeOnboarding") || "Complete Onboarding"}
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