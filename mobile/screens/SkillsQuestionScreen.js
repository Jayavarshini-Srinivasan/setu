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

import {
  API_BASE_URL,
} from "@env";

export default function SkillsQuestionScreen({
  navigation,
}) {

  /*
  =====================================
  CONTEXT
  =====================================
  */

  const {
    onboardingData,
    updateField,
    addTranscript,
  } = useOnboarding();

  /*
  =====================================
  STATES
  =====================================
  */

  const [
    isProcessing,
    setIsProcessing,
  ] = useState(false);

  const [
    recording,
    setRecording,
  ] = useState(null);

  const [
    transcript,
    setTranscript,
  ] = useState("");

  const [
    selectedSkills,
    setSelectedSkills,
  ] = useState(
    onboardingData.skills || []
  );

  /*
  =====================================
  ROLE
  =====================================
  */

  const role =
    onboardingData
      .canonicalRole ||
    onboardingData.role ||
    "";

  /*
  =====================================
  SKILL OPTIONS
  =====================================
  */

  const skillOptions =
    SKILLS_BY_ROLE[
      role
    ] || [];

  /*
  =====================================
  START RECORDING
  =====================================
  */

  const startRecording =
    async () => {

      /*
      PREVENT DOUBLE RECORDING
      */

      if (recording) {
        return;
      }

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
  =====================================
  STOP RECORDING
  =====================================
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

        setRecording(null);

        setIsProcessing(true);

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

      } finally {

        setIsProcessing(false);
      }
    };

  /*
  =====================================
  UPLOAD AUDIO
  =====================================
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

            `${API_BASE_URL}/voice/upload-audio`,

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

        console.log(data);

        /*
        SAFETY
        */

        if (!data.success) {

          Alert.alert(
            "Error",
            data.error ||
            "Failed to process audio"
          );

          return;
        }

        /*
        TRANSCRIPT
        */

        setTranscript(
          data.transcript || ""
        );

        addTranscript(
          data.transcript || ""
        );

        /*
        EXTRACTED SKILLS
        */

        const extractedSkills =
          data
            ?.extractedProfile
            ?.skills || [];

        /*
        MERGE
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
          "Failed to upload audio"
        );
      }
    };

  /*
  =====================================
  TOGGLE SKILL
  =====================================
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
  =====================================
  CONTINUE
  =====================================
  */

  const handleContinue =
    () => {

      if (
        selectedSkills.length === 0
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

  /*
  =====================================
  UI
  =====================================
  */

  return (

    <VoiceQuestionCard

      step={2}

      totalSteps={5}

      title="What kind of work can you do?"

      subtitle="Tap skills or speak naturally in your language."

      transcript={
        transcript
      }

      options={
        skillOptions
      }

      selectedOptions={
        selectedSkills
      }

      onSelectOption={
        toggleSkill
      }

      isRecording={
        !!recording
      }

      isProcessing={
        isProcessing
      }

      onStartRecording={
        startRecording
      }

      onStopRecording={
        stopRecording
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