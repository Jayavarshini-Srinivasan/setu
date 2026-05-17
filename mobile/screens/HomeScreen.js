import {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Button,
} from "react-native";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../services/firebase";

export default function HomeScreen({
  navigation,
}) {
  const [profile,
    setProfile] =
    useState(null);

  const [loading,
    setLoading] =
    useState(true);

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

        /*
          SAFETY CHECK
        */
        if (!currentUser) {
          setLoading(false);

          return;
        }

        const userRef = doc(
          db,
          "users",
          currentUser.uid
        );

        const userSnap =
          await getDoc(userRef);

        /*
          PROFILE EXISTS
        */
        if (userSnap.exists()) {
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
    LOADING
  */
  if (loading) {
    return (
      <View style={styles.center}>
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
      <View style={styles.center}>
        <Text>
          No profile found
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Welcome
      </Text>

      <Text style={styles.item}>
        Email:
        {" "}
        {
          auth.currentUser
            ?.email
        }
      </Text>

      <Text style={styles.item}>
        Worker Type:
        {" "}
        {
          profile.workerType
        }
      </Text>

      <Text style={styles.item}>
        Location:
        {" "}
        {
          profile.profile
            ?.location
        }
      </Text>

      <Text style={styles.item}>
        Skills:
        {" "}
        {
          profile.profile
            ?.skills?.join(
              ", "
            )
        }
      </Text>

      <Text style={styles.item}>
        Experience:
        {" "}
        {
          profile.profile
            ?.experience
        }
        {" "}
        years
      </Text>

      <View style={styles.button}>
        <Button
          title="View Matched Jobs"
          onPress={() =>
            navigation.navigate(
              "Results"
            )
          }
        />
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      padding: 20,
    },

    center: {
      flex: 1,

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    heading: {
      fontSize: 24,

      fontWeight: "bold",

      marginBottom: 20,
    },

    item: {
      fontSize: 16,

      marginBottom: 15,
    },

    button: {
      marginTop: 20,
    },
  });