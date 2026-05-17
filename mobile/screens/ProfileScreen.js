import {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import {
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../services/firebase";

export default function ProfileScreen() {

  const [
    profile,
    setProfile,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /*
    LOAD PROFILE
  */
  useEffect(() => {

    fetchProfile();

  }, []);

  const fetchProfile =
    async () => {

      try {

        const currentUser =
          auth.currentUser;

        if (!currentUser) {

          setLoading(false);

          return;
        }

        const userRef =
          doc(
            db,
            "users",
            currentUser.uid
          );

        const userSnap =
          await getDoc(
            userRef
          );

        if (
          userSnap.exists()
        ) {

          setProfile(
            userSnap.data()
          );
        }

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);
      }
    };

  /*
    LOGOUT
  */
  const handleLogout =
    async () => {

      try {

        await signOut(auth);

      } catch (error) {

        console.log(error);
      }
    };

  /*
    LOADING
  */
  if (loading) {

    return (

      <View
        style={
          styles.center
        }
      >

        <ActivityIndicator
          size="large"
        />

      </View>
    );
  }

  /*
    NO PROFILE
  */
  if (!profile) {

    return (

      <View
        style={
          styles.center
        }
      >

        <Text>
          No profile found
        </Text>

      </View>
    );
  }

  /*
    PROFILE DATA
  */
  const workerProfile =
    profile.profile || {};

  /*
    AI SUMMARY
  */
  const aiSummary =

    `Experienced ${workerProfile.canonicalRole || "worker"} based in ${workerProfile.location || "India"} with ${workerProfile.skills?.length || 0} verified skills and ${workerProfile.experience || 0} years of experience.`;

  /*
    PROFILE STRENGTH
  */
  const profileStrength =

    Math.min(

      100,

      (
        (workerProfile.skills?.length || 0) * 15
      ) +

      (
        (workerProfile.experience || 0) * 10
      ) +

      (
        workerProfile.location
          ? 20
          : 0
      ) +

      (
        workerProfile.canonicalRole
          ? 20
          : 0
      )
    );

  return (

    <ScrollView
      contentContainerStyle={
        styles.container
      }
    >

      {/* HEADER */}

      <View
        style={
          styles.headerCard
        }
      >

        <Text
          style={
            styles.name
          }
        >
          {
            workerProfile.canonicalRole ||
            "Worker"
          }
        </Text>

        <Text
          style={
            styles.email
          }
        >
          {
            auth.currentUser?.email
          }
        </Text>

        <Text
          style={
            styles.location
          }
        >
          📍 {
            workerProfile.location
          }
        </Text>

      </View>

      {/* AI SUMMARY */}

      <View
        style={
          styles.card
        }
      >

        <Text
          style={
            styles.cardTitle
          }
        >
          AI Summary
        </Text>

        <Text
          style={
            styles.summary
          }
        >
          {aiSummary}
        </Text>

      </View>

      {/* PROFILE STRENGTH */}

      <View
        style={
          styles.card
        }
      >

        <Text
          style={
            styles.cardTitle
          }
        >
          Match Readiness
        </Text>

        <Text
          style={
            styles.strength
          }
        >
          {profileStrength}%
        </Text>

      </View>

      {/* EXPERIENCE */}

      <View
        style={
          styles.card
        }
      >

        <Text
          style={
            styles.cardTitle
          }
        >
          Experience
        </Text>

        <Text
          style={
            styles.cardValue
          }
        >
          {
            workerProfile.experience
          } years
        </Text>

      </View>

      {/* SKILLS */}

      <View
        style={
          styles.card
        }
      >

        <Text
          style={
            styles.cardTitle
          }
        >
          Skills
        </Text>

        <View
          style={
            styles.skillsContainer
          }
        >

          {
            workerProfile.skills?.map(
              (skill) => (

                <View
                  key={skill}

                  style={
                    styles.skillChip
                  }
                >

                  <Text
                    style={
                      styles.skillText
                    }
                  >
                    {skill}
                  </Text>

                </View>
              )
            )
          }

        </View>

      </View>

      {/* WORK PREFERENCES */}

      <View
        style={
          styles.card
        }
      >

        <Text
          style={
            styles.cardTitle
          }
        >
          Work Preferences
        </Text>

        <Text
          style={
            styles.cardValue
          }
        >
          {
            workerProfile
              ?.labourData
              ?.availability
          }
        </Text>

        <Text
          style={
            styles.cardValue
          }
        >
          {
            workerProfile
              ?.labourData
              ?.preferredShift
          } shift
        </Text>

      </View>

      {/* LOGOUT */}

      <TouchableOpacity
        style={
          styles.logoutButton
        }

        onPress={
          handleLogout
        }
      >

        <Text
          style={
            styles.logoutText
          }
        >
          Logout
        </Text>

      </TouchableOpacity>

    </ScrollView>
  );
}

const styles =
  StyleSheet.create({

    container: {
      padding: 20,

      backgroundColor:
        "#f5f7fa",

      paddingBottom: 50,
    },

    center: {
      flex: 1,

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    headerCard: {
      backgroundColor:
        "#111",

      padding: 24,

      borderRadius: 24,

      marginBottom: 20,
    },

    name: {
      fontSize: 30,

      fontWeight: "bold",

      color: "#fff",

      textTransform:
        "capitalize",
    },

    email: {
      color: "#ccc",

      marginTop: 8,

      fontSize: 15,
    },

    location: {
      color: "#fff",

      marginTop: 14,

      fontSize: 16,
    },

    card: {
      backgroundColor:
        "#fff",

      padding: 20,

      borderRadius: 20,

      marginBottom: 18,
    },

    cardTitle: {
      fontSize: 18,

      fontWeight: "bold",

      marginBottom: 14,
    },

    summary: {
      fontSize: 16,

      lineHeight: 24,

      color: "#444",
    },

    strength: {
      fontSize: 42,

      fontWeight: "bold",

      color: "#27ae60",
    },

    cardValue: {
      fontSize: 16,

      marginBottom: 10,
    },

    skillsContainer: {
      flexDirection: "row",

      flexWrap: "wrap",

      gap: 10,
    },

    skillChip: {
      backgroundColor:
        "#2980b9",

      paddingVertical: 10,

      paddingHorizontal: 16,

      borderRadius: 30,
    },

    skillText: {
      color: "#fff",

      fontWeight: "600",
    },

    logoutButton: {
      backgroundColor:
        "#e74c3c",

      padding: 18,

      borderRadius: 16,

      alignItems:
        "center",

      marginTop: 20,
    },

    logoutText: {
      color: "#fff",

      fontSize: 18,

      fontWeight: "bold",
    },
  });