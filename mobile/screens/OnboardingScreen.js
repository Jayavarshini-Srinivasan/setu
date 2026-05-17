import { useState } from "react";

import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { auth } from "../services/firebase";

import {
  updateUserProfile,
} from "../services/profileService";

export default function OnboardingScreen({
  navigation,
}) {

  /*
    WORKER TYPE
  */
  const [
    workerType,
    setWorkerType,
  ] = useState("");

  /*
    PROFESSIONAL FORM
  */
  const [role, setRole] =
    useState("delivery");

  const [skills, setSkills] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [
    experience,
    setExperience,
  ] = useState("");

  /*
    PROFESSIONAL SUBMIT
  */
  const handleSubmit =
    async () => {

      try {

        const uid =
          auth.currentUser.uid;

        await updateUserProfile(
          uid,
          {

            workerType:
              "professional",

            onboardingCompleted:
              true,

            profile: {

              role,

              name:
                auth.currentUser.email,

              skills:
                skills
                  .split(",")
                  .map((skill) =>
                    skill.trim()
                  ),

              location,

              experience:
                Number(
                  experience
                ),

              professionalData: {

                education: "",

                certifications:
                  [],

                expectedSalary:
                  0,

                preferredRoles:
                  [],
              },
            },
          }
        );

        navigation.navigate(
          "Results"
        );

      } catch (error) {

        console.log(error);

        alert(
          "Failed to save onboarding"
        );
      }
    };

  /*
    WORKER TYPE SELECTION
  */
  if (!workerType) {

    return (

      <View
        style={
          styles.container
        }
      >

        <Text
          style={
            styles.heading
          }
        >
          Choose Worker Type
        </Text>

        <TouchableOpacity
          style={
            styles.labourButton
          }

          onPress={() => {

            setWorkerType(
              "labour"
            );

            navigation.navigate(
              "VoiceOnboarding"
            );
          }}
        >

          <Text
            style={
              styles.buttonText
            }
          >
            Labour Worker
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={
            styles.professionalButton
          }

          onPress={() =>
            setWorkerType(
              "professional"
            )
          }
        >

          <Text
            style={
              styles.buttonText
            }
          >
            Professional Worker
          </Text>

        </TouchableOpacity>

      </View>
    );
  }

  /*
    PROFESSIONAL ONBOARDING
  */
  return (

    <View
      style={
        styles.container
      }
    >

      <Text
        style={
          styles.heading
        }
      >
        Professional Profile
      </Text>

      <Text>
        Role
      </Text>

      <TextInput
        style={
          styles.input
        }

        value={role}

        onChangeText={
          setRole
        }
      />

      <Text>
        Skills
      </Text>

      <TextInput
        style={
          styles.input
        }

        value={skills}

        onChangeText={
          setSkills
        }

        placeholder="react,nodejs,design"
      />

      <Text>
        Location
      </Text>

      <TextInput
        style={
          styles.input
        }

        value={location}

        onChangeText={
          setLocation
        }
      />

      <Text>
        Experience
      </Text>

      <TextInput
        style={
          styles.input
        }

        value={experience}

        onChangeText={
          setExperience
        }

        keyboardType="numeric"
      />

      <Button
        title="Submit"
        onPress={
          handleSubmit
        }
      />

    </View>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,

      padding: 20,

      justifyContent:
        "center",
    },

    heading: {
      fontSize: 28,

      fontWeight: "bold",

      marginBottom: 30,

      textAlign:
        "center",
    },

    input: {
      borderWidth: 1,

      padding: 12,

      marginBottom: 20,

      borderRadius: 8,
    },

    labourButton: {
      backgroundColor:
        "#27ae60",

      padding: 18,

      borderRadius: 12,

      marginBottom: 20,
    },

    professionalButton: {
      backgroundColor:
        "#2980b9",

      padding: 18,

      borderRadius: 12,
    },

    buttonText: {
      color: "#fff",

      fontSize: 18,

      fontWeight: "bold",

      textAlign:
        "center",
    },
  });