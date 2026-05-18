import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import {
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../../services/firebase";

import {
  useOnboarding,
} from "../../context/OnboardingContext";

export default function ProfessionalReviewScreen({
  navigation,
}) {

  /*
    CONTEXT
  */
  const {
    onboardingData,

    resetOnboarding,

    refreshOnboarding,
  } = useOnboarding();

  /*
    COMPLETE ONBOARDING
  */
  const handleComplete =
    async () => {

      try {

        const uid =
          auth.currentUser.uid;

        /*
          USER REF
        */
        const userRef =
          doc(
            db,
            "users",
            uid
          );

        /*
          SAVE PROFILE
        */
        await updateDoc(
          userRef,
          {

            workerType:
              "professional",

            onboardingCompleted:
              true,

            profile: {

              professionalRole:
                onboardingData.professionalRole,

              education:
                onboardingData.education,

              professionalSkills:
                onboardingData.professionalSkills,

              experienceDetails:
                onboardingData.experienceDetails,

              linkedin:
                onboardingData.linkedin,

              github:
                onboardingData.github,

              portfolio:
                onboardingData.portfolio,

              /*
                preferredRoles — keep for backward compat
                careerGoal     — string, used by learningPathService
              */
              preferredRoles:
                onboardingData.preferredRoles,

              careerGoal:
                (onboardingData.preferredRoles || [])[0] || "",

              transcriptHistory:
                onboardingData.transcriptHistory,
            },
          }
        );

        /*
          REFRESH APP STATE — triggers App.js to navigate to ProfessionalApp
        */
        refreshOnboarding();
        resetOnboarding();

      } catch (error) {

        console.log(error);

        Alert.alert(
          "Error",
          "Failed to save profile. Please try again."
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
        Review Your Professional Profile
      </Text>

      <Text style={styles.subtitle}>
        Confirm your details before continuing.
      </Text>

      {/* ROLE */}

      <View style={styles.card}>

        <Text style={styles.label}>
          Professional Role
        </Text>

        <Text style={styles.value}>
          {
            onboardingData.professionalRole
          }
        </Text>

      </View>

      {/* EDUCATION */}

      <View style={styles.card}>

        <Text style={styles.label}>
          Education
        </Text>

        <Text style={styles.value}>
          {
            onboardingData.education?.degree
          }
        </Text>

        <Text style={styles.secondary}>
          {
            onboardingData.education?.institution
          }
        </Text>

        <Text style={styles.secondary}>
          Graduation:
          {" "}
          {
            onboardingData.education?.graduationYear
          }
        </Text>

      </View>

      {/* SKILLS */}

      <View style={styles.card}>

        <Text style={styles.label}>
          Professional Skills
        </Text>

        <Text style={styles.value}>
          {
            (
              onboardingData.professionalSkills || []
            ).join(", ")
          }
        </Text>

      </View>

      {/* EXPERIENCE */}

      <View style={styles.card}>

        <Text style={styles.label}>
          Experience
        </Text>

        {
          (
            onboardingData.experienceDetails || []
          ).map(
            (
              item,
              index
            ) => (

              <View
                key={index}
                style={styles.experienceItem}
              >

                <Text style={styles.value}>
                  {item.role}
                </Text>

                <Text style={styles.secondary}>
                  {item.company}
                </Text>

                <Text style={styles.secondary}>
                  {item.years} years
                </Text>

              </View>
            )
          )
        }

      </View>

      {/* LINKS */}

      <View style={styles.card}>

        <Text style={styles.label}>
          Professional Links
        </Text>

        {
          onboardingData.linkedin ? (
            <Text style={styles.secondary}>
              LinkedIn:
              {" "}
              {
                onboardingData.linkedin
              }
            </Text>
          ) : null
        }

        {
          onboardingData.github ? (
            <Text style={styles.secondary}>
              GitHub:
              {" "}
              {
                onboardingData.github
              }
            </Text>
          ) : null
        }

        {
          onboardingData.portfolio ? (
            <Text style={styles.secondary}>
              Portfolio:
              {" "}
              {
                onboardingData.portfolio
              }
            </Text>
          ) : null
        }

      </View>

      {/* GOALS */}

      <View style={styles.card}>

        <Text style={styles.label}>
          Career Goals
        </Text>

        <Text style={styles.value}>
          {
            (
              onboardingData.preferredRoles || []
            ).join(", ")
          }
        </Text>

      </View>

      {/* COMPLETE */}

      <TouchableOpacity
        style={styles.button}

        onPress={handleComplete}
      >

        <Text style={styles.buttonText}>
          Complete Professional Onboarding
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

      marginTop: 40,

      marginBottom: 12,
    },

    subtitle: {
      fontSize: 16,

      color: "#666",

      marginBottom: 30,
    },

    card: {
      backgroundColor:
        "#F8FAFC",

      padding: 18,

      borderRadius: 18,

      marginBottom: 18,
    },

    label: {
      fontSize: 14,

      color: "#666",

      marginBottom: 8,
    },

    value: {
      fontSize: 18,

      fontWeight: "bold",

      marginBottom: 4,
    },

    secondary: {
      fontSize: 15,

      color: "#555",

      marginBottom: 2,
    },

    experienceItem: {
      marginBottom: 16,
    },

    button: {
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
  });