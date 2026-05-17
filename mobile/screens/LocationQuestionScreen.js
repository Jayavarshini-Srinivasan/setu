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
  ScrollView,
} from "react-native";

import {
  Audio,
} from "expo-av";

import {
  useOnboarding,
} from "../context/OnboardingContext";

export default function LocationQuestionScreen({
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
    LOCATION
  */
  const [
    location,
    setLocation,
  ] = useState(
    onboardingData
      .location || ""
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
    COMMON LOCATIONS
  */
  const locationOptions = [
    "Chennai",
    "Bangalore",
    "Hyderabad",
    "Mumbai",
    "Delhi",
    "Pune",
    "Coimbatore",
    "Noida",
  ];

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
          LOCATION
        */
        const extractedLocation =
          data
            .extractedProfile
            .location || "";

        setLocation(
          extractedLocation
        );

        updateField(
          "location",
          extractedLocation
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
    SELECT LOCATION
  */
  const selectLocation =
    (
      selectedLocation
    ) => {

      setLocation(
        selectedLocation
      );

      updateField(
        "location",
        selectedLocation
      );
    };

  /*
    CONTINUE
  */
  const handleContinue =
    () => {

      if (
        !location
      ) {

        Alert.alert(
          "Required",
          "Please select or enter location"
        );

        return;
      }

      updateField(
        "location",
        location
      );

      navigation.navigate(
        "PreferencesQuestion"
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
        Which city do you work in?
      </Text>

      <Text
        style={
          styles.subtitle
        }
      >
        You can type, select, or speak your location.
      </Text>

      {/* INPUT */}

      <TextInput
        style={
          styles.input
        }

        placeholder="Enter city"

        value={
          location
        }

        onChangeText={
          setLocation
        }
      />

      {/* VOICE */}

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

      {/* LOCATION CHIPS */}

      <ScrollView
        contentContainerStyle={
          styles.optionsContainer
        }
      >

        {
          locationOptions.map(
            (city) => {

              const isSelected =
                location ===
                city;

              return (

                <TouchableOpacity
                  key={city}

                  style={[
                    styles.optionChip,

                    isSelected &&
                      styles.selectedChip,
                  ]}

                  onPress={() =>
                    selectLocation(
                      city
                    )
                  }
                >

                  <Text
                    style={[
                      styles.optionText,

                      isSelected &&
                        styles.selectedText,
                    ]}
                  >
                    {city}
                  </Text>

                </TouchableOpacity>
              );
            }
          )
        }

      </ScrollView>

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

      marginBottom: 24,
    },

    voiceButton: {
      backgroundColor:
        "#27ae60",

      padding: 18,

      borderRadius: 16,

      alignItems:
        "center",

      marginBottom: 24,
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

      marginBottom: 24,
    },

    transcriptLabel: {
      fontWeight: "bold",

      marginBottom: 10,
    },

    transcriptText: {
      fontSize: 16,

      color: "#333",
    },

    optionsContainer: {
      flexDirection: "row",

      flexWrap: "wrap",

      gap: 12,

      marginBottom: 40,
    },

    optionChip: {
      borderWidth: 1,

      borderColor:
        "#ccc",

      borderRadius: 30,

      paddingVertical: 12,

      paddingHorizontal: 18,
    },

    selectedChip: {
      backgroundColor:
        "#2980b9",

      borderColor:
        "#2980b9",
    },

    optionText: {
      fontSize: 16,
    },

    selectedText: {
      color: "#fff",

      fontWeight: "bold",
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