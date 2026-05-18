import {
  useState,
} from "react";

import {
  Alert,
} from "react-native";

import VoiceQuestionCard from "../../components/VoiceQuestionCard";
import { Audio } from "expo-av";
import { API_BASE_URL } from "@env";

import {
  useOnboarding,
} from "../../context/OnboardingContext";

export default function ProfessionalRoleScreen({
  navigation,
}) {

  /*
    CONTEXT
  */
  const {
    onboardingData,
    updateField,
    addTranscript,
  } = useOnboarding();

  /*
    LOCAL STATE
  */
  const [
    selectedRole,
    setSelectedRole,
  ] = useState(
    onboardingData.professionalRole || ""
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [recording, setRecording] = useState(null);
  const [transcript, setTranscript] = useState("");

  /*
    PROFESSIONAL ROLES
  */
  const professionalRoles = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Analyst",
    "UI/UX Designer",
    "Product Manager",
    "Marketing Specialist",
    "HR Executive",
    "Finance Associate",
    "Business Analyst",
  ];

  /*
    START RECORDING
  */
  const startRecording = async () => {
    if (recording) return;

    try {
      const permission = await Audio.requestPermissionsAsync();

      if (permission.status !== "granted") {
        Alert.alert("Permission Required", "Microphone permission is required");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to start recording");
    }
  };

  /*
    STOP RECORDING
  */
  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsProcessing(true);

      await uploadAudio(uri);
      setIsProcessing(false);
    } catch (error) {
      console.log(error);
      setIsProcessing(false);
      Alert.alert("Error", "Failed to stop recording");
    }
  };

  /*
    UPLOAD AUDIO
  */
  const uploadAudio = async (audioUri) => {
    try {
      const formData = new FormData();
      formData.append("audio", {
        uri: audioUri,
        name: "voice-recording.m4a",
        type: "audio/m4a",
      });

      const response = await fetch(`${API_BASE_URL}/voice/upload-audio`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();
      console.log(data);

      setTranscript(data.transcript);
      addTranscript(data.transcript);

      // The AI might return something generic. In a real app we'd map this better.
      const extractedRole = data.extractedProfile?.rawRole || data.extractedProfile?.canonicalRole;
      if (extractedRole && extractedRole !== "other") {
        setSelectedRole(extractedRole);
        updateField("professionalRole", extractedRole);
      }
    } catch (error) {
      console.log(error);
      setIsProcessing(false);
      Alert.alert("Error", "Failed to process audio");
    }
  };

  /*
    SELECT ROLE
  */
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    updateField("professionalRole", role);
    updateField("workerType", "professional");
  };

  /*
    CONTINUE
  */
  const handleContinue = () => {
    if (!selectedRole) {
      Alert.alert("Required", "Please select a professional role");
      return;
    }

    navigation.navigate("Education");
  };

  return (
    <VoiceQuestionCard
      step={1}
      totalSteps={7}
      title="What professional role are you aiming for?"
      subtitle="You can tap a role or speak in your own language."
      transcript={transcript}
      options={professionalRoles}
      selectedOption={selectedRole}
      onSelectOption={handleSelectRole}
      isRecording={!!recording}
      isProcessing={isProcessing}
      onStartRecording={startRecording}
      onStopRecording={stopRecording}
      onContinue={handleContinue}
    />
  );
}