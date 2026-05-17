import {
  useState,
} from "react";

import {
  Alert,
} from "react-native";

import {
  Audio,
} from "expo-av";

import VoiceQuestionCard from "../components/VoiceQuestionCard";

import {
  useOnboarding,
} from "../context/OnboardingContext";

export default function RoleQuestionScreen({
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
    RECORDING STATE
  */
  const [
    recording,
    setRecording,
  ] = useState(null);

  const [
    transcript,
    setTranscript,
  ] = useState("");

  const [
    selectedRole,
    setSelectedRole,
  ] = useState(
    onboardingData
      .canonicalRole || ""
  );

  /*
    ROLE OPTIONS
  */
  const roleOptions = [
    "driver",
    "delivery",
    "warehouse",
    "electrician",
    "construction",
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

        /*
          STOP
        */
        await recording.stopAndUnloadAsync();

        const uri =
          recording.getURI();

        setRecording(
          null
        );

        /*
          UPLOAD AUDIO
        */
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
          EXTRACTED ROLE
        */
        const extractedRole =
          data
            .extractedProfile
            .canonicalRole;

        /*
          AUTO SELECT ROLE
        */
        setSelectedRole(
          extractedRole
        );

        /*
          SAVE TO CONTEXT
        */
        updateField(
          "canonicalRole",
          extractedRole
        );

        updateField(
          "role",
          extractedRole
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
    SELECT ROLE
  */
  const handleSelectRole =
    (role) => {

      setSelectedRole(
        role
      );

      updateField(
        "canonicalRole",
        role
      );

      updateField(
        "role",
        role
      );
    };

  /*
    CONTINUE
  */
  const handleContinue =
    () => {

      if (
        !selectedRole
      ) {

        Alert.alert(
          "Required",
          "Please select or speak your role"
        );

        return;
      }

      /*
        NEXT SCREEN
      */
      navigation.navigate(
        "SkillsQuestion"
      );
    };

  return (

    <VoiceQuestionCard

      title="What work do you do?"

      subtitle="You can tap a role or speak in your own language."

      transcript={
        transcript
      }

      options={
        roleOptions
      }

      selectedOption={
        selectedRole
      }

      onSelectOption={
        handleSelectRole
      }

      onVoicePress={
        recording
          ? stopRecording
          : startRecording
      }

      onContinue={
        handleContinue
      }
    />
  );
}