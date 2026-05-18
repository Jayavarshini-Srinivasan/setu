import {
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import {
  Audio,
} from "expo-av";

import {
  auth,
  db,
} from "../services/firebase";

import {
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  API_BASE_URL,
} from "@env";

export default function VoiceOnboardingScreen() {

  const [
    recording,
    setRecording,
  ] = useState(null);

  const [
    recordingUri,
    setRecordingUri,
  ] = useState("");

  const [
    sound,
    setSound,
  ] = useState(null);

  const [
    isRecording,
    setIsRecording,
  ] = useState(false);

  const [
    extractedData,
    setExtractedData,
  ] = useState(null);

  /*
    START RECORDING
  */
  const startRecording =
    async () => {

      try {

        /*
          MIC PERMISSION
        */
        const permission =
          await Audio.requestPermissionsAsync();

        if (
          permission.status !==
          "granted"
        ) {

          alert(
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

        setIsRecording(
          true
        );

      } catch (error) {

        console.log(error);

        alert(
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

        /*
          STOP
        */
        await recording.stopAndUnloadAsync();

        /*
          URI
        */
        const uri =
          recording.getURI();

        console.log(
          "AUDIO URI:",
          uri
        );

        setRecordingUri(
          uri
        );

        setRecording(
          null
        );

        setIsRecording(
          false
        );

      } catch (error) {

        console.log(error);

        alert(
          "Failed to stop recording"
        );
      }
    };

  /*
    PLAY RECORDING
  */
  const playRecording =
    async () => {

      try {

        if (!recordingUri) {
          return;
        }

        /*
          CREATE SOUND
        */
        const {
          sound,
        } =
          await Audio.Sound.createAsync(
            {
              uri:
                recordingUri,
            }
          );

        setSound(sound);

        /*
          PLAY
        */
        await sound.playAsync();

      } catch (error) {

        console.log(error);

        alert(
          "Failed to play recording"
        );
      }
    };

  /*
    UPLOAD AUDIO
  */
  const uploadAudio =
    async () => {

      try {

        if (
          !recordingUri
        ) {
          return;
        }

        const formData =
          new FormData();

        formData.append(
          "audio",
          {
            uri:
              recordingUri,

            name:
              "voice-recording.m4a",

            type:
              "audio/m4a",
          }
        );

        const response =
          await fetch(`${API_BASE_URL}/voice/upload-audio`,
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
          SAVE AI DATA
        */
        setExtractedData(
          data
        );

        alert(
          "Audio uploaded successfully"
        );

      } catch (error) {

        console.log(error);

        alert(
          "Upload failed"
        );
      }
    };

  /*
    SAVE PROFILE
  */
  const confirmProfile =
    async () => {

      try {

        if (
          !extractedData
        ) {
          return;
        }

        const profile =
          extractedData
            .extractedProfile;

        /*
          USER REF
        */
        const userRef =
          doc(
            db,
            "users",
            auth.currentUser.uid
          );

        /*
          SAVE PROFILE
        */
        await updateDoc(
          userRef,
          {

            profile: {

              /*
                LEGACY
              */
              jobRole:
                profile.canonicalRole,

              skills:
                profile.skills,

              experience:
                profile.experience,

              location:
                profile.location,

              /*
                AI FIELDS
              */
              rawRole:
                profile.rawRole,

              canonicalRole:
                profile.canonicalRole,

              category:
                profile.category,
            },

            onboardingCompleted:
              true,
          }
        );

        alert(
          "Profile saved successfully"
        );

      } catch (error) {

        console.log(error);

        alert(
          "Failed to save profile"
        );
      }
    };

  return (

    <ScrollView
      contentContainerStyle={
        styles.container
      }
    >

      <Text style={styles.heading}>
        Voice Onboarding
      </Text>

      <Text style={styles.subheading}>
        Tell us about your work experience in your own language.
      </Text>

      {
        !isRecording ? (
          <TouchableOpacity
            style={styles.recordButton}
            onPress={
              startRecording
            }
          >

            <Text style={styles.buttonText}>
              Start Recording
            </Text>

          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={
              stopRecording
            }
          >

            <Text style={styles.buttonText}>
              Stop Recording
            </Text>

          </TouchableOpacity>
        )
      }

      {
        recordingUri ? (
          <View style={styles.audioContainer}>

            <Text style={styles.audioLabel}>
              Recording Ready
            </Text>

            <TouchableOpacity
              style={styles.playButton}
              onPress={
                playRecording
              }
            >

              <Text style={styles.buttonText}>
                Play Recording
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={
                uploadAudio
              }
            >

              <Text style={styles.buttonText}>
                Upload Audio
              </Text>

            </TouchableOpacity>

            <Text style={styles.uriText}>
              {recordingUri}
            </Text>

          </View>
        ) : null
      }

      {
        extractedData ? (

          <View
            style={
              styles.resultContainer
            }
          >

            <Text
              style={
                styles.resultTitle
              }
            >
              AI Extracted Profile
            </Text>

            <Text>
              Transcript:
            </Text>

            <Text
              style={
                styles.resultText
              }
            >
              {
                extractedData
                  .transcript
              }
            </Text>

            <Text>
              Role:
            </Text>

            <Text
              style={
                styles.resultText
              }
            >
              {
                extractedData
                  .extractedProfile
                  .canonicalRole
              }
            </Text>

            <Text>
              Location:
            </Text>

            <Text
              style={
                styles.resultText
              }
            >
              {
                extractedData
                  .extractedProfile
                  .location
              }
            </Text>

            <Text>
              Skills:
            </Text>

            <Text
              style={
                styles.resultText
              }
            >
              {
                extractedData
                  .extractedProfile
                  .skills
                  .join(", ")
              }
            </Text>

            <Text>
              Experience:
            </Text>

            <Text
              style={
                styles.resultText
              }
            >
              {
                extractedData
                  .extractedProfile
                  .experience
              } years
            </Text>

            <TouchableOpacity
              style={
                styles.confirmButton
              }

              onPress={
                confirmProfile
              }
            >

              <Text
                style={
                  styles.buttonText
                }
              >
                Confirm Profile
              </Text>

            </TouchableOpacity>

          </View>

        ) : null
      }

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

    heading: {
      fontSize: 28,

      fontWeight: "bold",

      marginTop: 40,

      marginBottom: 12,
    },

    subheading: {
      fontSize: 16,

      color: "#666",

      marginBottom: 40,
    },

    recordButton: {
      backgroundColor:
        "#27ae60",

      padding: 18,

      borderRadius: 12,

      alignItems:
        "center",
    },

    stopButton: {
      backgroundColor:
        "#e74c3c",

      padding: 18,

      borderRadius: 12,

      alignItems:
        "center",
    },

    playButton: {
      backgroundColor:
        "#2980b9",

      padding: 16,

      borderRadius: 12,

      alignItems:
        "center",

      marginTop: 20,
    },

    uploadButton: {
      backgroundColor:
        "#8e44ad",

      padding: 16,

      borderRadius: 12,

      alignItems:
        "center",

      marginTop: 20,
    },

    confirmButton: {
      backgroundColor:
        "#27ae60",

      padding: 16,

      borderRadius: 12,

      alignItems:
        "center",

      marginTop: 20,
    },

    buttonText: {
      color: "#fff",

      fontSize: 18,

      fontWeight: "bold",
    },

    audioContainer: {
      marginTop: 40,
    },

    audioLabel: {
      fontSize: 18,

      fontWeight: "600",
    },

    uriText: {
      marginTop: 16,

      fontSize: 12,

      color: "#999",
    },

    resultContainer: {
      marginTop: 40,

      padding: 20,

      borderRadius: 12,

      backgroundColor:
        "#f4f6f8",
    },

    resultTitle: {
      fontSize: 22,

      fontWeight: "bold",

      marginBottom: 20,
    },

    resultText: {
      marginBottom: 16,

      fontSize: 16,

      color: "#333",
    },
  });