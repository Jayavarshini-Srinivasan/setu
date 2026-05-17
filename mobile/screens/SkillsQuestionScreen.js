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

import {
  SKILLS_BY_ROLE,
} from "../constants/skills";

export default function SkillsQuestionScreen({
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

  /*
    SELECTED SKILLS
  */
  const [
    selectedSkills,
    setSelectedSkills,
  ] = useState(
    onboardingData.skills || []
  );

  /*
    ROLE
  */
  const role =
    onboardingData
      .canonicalRole ||
    onboardingData.role;

  /*
    SKILL OPTIONS
  */
  const skillOptions =
    SKILLS_BY_ROLE[
      role
    ] || [];

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
          AI SKILLS
        */
        const extractedSkills =
          data
            .extractedProfile
            .skills || [];

        /*
          MERGE SKILLS
        */
        const mergedSkills =
          [
            ...new Set([
              ...selectedSkills,
              ...extractedSkills,
            ]),
          ];

        setSelectedSkills(
          mergedSkills
        );

        updateField(
          "skills",
          mergedSkills
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
    TOGGLE SKILL
  */
  const toggleSkill =
    (skill) => {

      let updatedSkills =
        [];

      /*
        REMOVE
      */
      if (
        selectedSkills.includes(
          skill
        )
      ) {

        updatedSkills =
          selectedSkills.filter(
            (item) =>
              item !== skill
          );
      }

      /*
        ADD
      */
      else {

        updatedSkills = [
          ...selectedSkills,
          skill,
        ];
      }

      setSelectedSkills(
        updatedSkills
      );

      updateField(
        "skills",
        updatedSkills
      );
    };

  /*
    CONTINUE
  */
  const handleContinue =
    () => {

      if (
        selectedSkills.length ===
        0
      ) {

        Alert.alert(
          "Required",
          "Please select at least one skill"
        );

        return;
      }

      navigation.navigate(
        "ExperienceQuestion"
      );
    };

  return (

    <VoiceQuestionCard

      title="What skills do you have?"

      subtitle="Select skills or speak naturally in your language."

      transcript={
        transcript
      }

      options={
        skillOptions
      }

      selectedOption={
        selectedSkills
      }

      onSelectOption={
        toggleSkill
      }

      onVoicePress={
        recording
          ? stopRecording
          : startRecording
      }

      onContinue={
        handleContinue
      }

      selectedSkills={
        selectedSkills
      }
    />
  );
}