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
  Audio,
} from "expo-av";

import {
  useOnboarding,
} from "../context/OnboardingContext";

export default function ExperienceQuestionScreen({
  navigation,
}) {

  /*
    ONBOARDING CONTEXT
  */
  const {
    onboardingData,

    updateField,

    addTranscript,
  } = useOnboarding();

  /*
    EXPERIENCE
  */
  const [
    experience,
    setExperience,
  ] = useState(
    onboardingData
      .experience
      ?.toString() || ""
  );

  /*
    TRANSCRIPT
  */
  const [
    transcript,
    setTranscript,
  ] = useState("");

  /*
    RECORDING
  */
  const [
    recording,
    setRecording,
  ] = useState(null);

  /*
    START RECORDING
  */
  const startRecording =
    async () => {

      try {

        const permission =
          await Audio.requestPermissionsAsync();

        if (
          permission.status !==
          "granted"
        ) {

          Alert.alert(
            "Permission Required",
            "Microphone permission is required"
          );

          return;
        }

        /*
          AUDIO MODE
        */
        await Audio.setAudioModeAsync({
          allowsRecordingIOS:
            true,

          playsInSilentModeIOS:
            true,
        });

        /*
          CREATE RECORDING
        */
        const {
          recording,
        } =
          await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
          );

        setRecording(
          recording
        );

      } catch (error) {

        console.log(error);

        Alert.alert(
          "Error",
          "Failed to start recording"
        );
      }
    };

  /*
    STOP RECORDING
  */
  const stopRecording =
    async () => {

      try {

        if (!recording) {
          return;
        }

        await recording.stopAndUnloadAsync();

        const uri =
          recording.getURI();

        setRecording(
          null
        );

        await uploadAudio(
          uri
        );

      } catch (error) {

        console.log(error);

        Alert.alert(
          "Error",
          "Failed to stop recording"
        );
      }
    };

  /*
    UPLOAD AUDIO
  */
  const uploadAudio =
    async (
      audioUri
    ) => {

      try {

        const formData =
          new FormData();

        formData.append(
          "audio",
          {
            uri:
              audioUri,

            name:
              "voice-recording.m4a",

            type:
              "audio/m4a",
          }
        );

        const response =
          await fetch(
            "http://192.168.0.108:5000/voice/upload-audio",
            {
              method:
                "POST",

              body:
                formData,

              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        const data =
          await response.json();

        console.log(
          data
        );

        /*
          TRANSCRIPT
        */
        setTranscript(
          data.transcript
        );

        addTranscript(
          data.transcript
        );

        /*
          EXPERIENCE
        */
        const extractedExperience =
          data
            .extractedProfile
            .experience || 0;

        setExperience(
          extractedExperience
            .toString()
        );

        updateField(
          "experience",
          extractedExperience
        );

      } catch (error) {

        console.log(error);

        Alert.alert(
          "Error",
          "Failed to process audio"
        );
      }
    };

  /*
    CONTINUE
  */
  const handleContinue =
    () => {

      if (
        !experience
      ) {

        Alert.alert(
          "Required",
          "Please enter experience"
        );

        return;
      }

      updateField(
        "experience",
        Number(
          experience
        )
      );

      navigation.navigate(
        "LocationQuestion"
      );
    };

  return (

    <View
      style={
        styles.container
      }
    >

      <Text
        style={
          styles.title
        }
      >
        How many years of experience do you have?
      </Text>

      <Text
        style={
          styles.subtitle
        }
      >
        You can type or speak naturally in your language.
      </Text>

      {/* INPUT */}

      <TextInput
        style={
          styles.input
        }

        placeholder="Example: 3"

        keyboardType="numeric"

        value={
          experience
        }

        onChangeText={
          setExperience
        }
      />

      {/* VOICE BUTTON */}

      <TouchableOpacity
        style={
          styles.voiceButton
        }

        onPress={
          recording
            ? stopRecording
            : startRecording
        }
      >

        <Text
          style={
            styles.voiceText
          }
        >
          🎤 Tap to Speak
        </Text>

      </TouchableOpacity>

      {/* TRANSCRIPT */}

      {
        transcript ? (

          <View
            style={
              styles.transcriptBox
            }
          >

            <Text
              style={
                styles.transcriptLabel
              }
            >
              Transcript
            </Text>

            <Text
              style={
                styles.transcriptText
              }
            >
              {transcript}
            </Text>

          </View>

        ) : null
      }

      {/* CONTINUE */}

      <TouchableOpacity
        style={
          styles.continueButton
        }

        onPress={
          handleContinue
        }
      >

        <Text
          style={
            styles.continueText
          }
        >
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

      padding: 24,

      justifyContent:
        "center",

      backgroundColor:
        "#fff",
    },

    title: {
      fontSize: 30,

      fontWeight: "bold",

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
        "#ccc",

      borderRadius: 14,

      padding: 18,

      fontSize: 18,

      marginBottom: 30,
    },

    voiceButton: {
      backgroundColor:
        "#27ae60",

      padding: 18,

      borderRadius: 16,

      alignItems:
        "center",

      marginBottom: 30,
    },

    voiceText: {
      color: "#fff",

      fontSize: 18,

      fontWeight: "bold",
    },

    transcriptBox: {
      backgroundColor:
        "#f4f6f8",

      padding: 18,

      borderRadius: 12,

      marginBottom: 30,
    },

    transcriptLabel: {
      fontWeight: "bold",

      marginBottom: 10,
    },

    transcriptText: {
      fontSize: 16,

      color: "#333",
    },

    continueButton: {
      backgroundColor:
        "#000",

      padding: 18,

      borderRadius: 16,

      alignItems:
        "center",
    },

    continueText: {
      color: "#fff",

      fontSize: 18,

      fontWeight: "bold",
    },
  });