import { useState } from "react";
import { Alert } from "react-native";

import VoiceQuestionCard from "../../components/VoiceQuestionCard";
import useVoiceRecorder from "../../hooks/useVoiceRecorder";
import { useOnboarding } from "../../context/OnboardingContext";
import { useI18n } from "../../context/I18nContext";

const PROFESSIONAL_ROLES = [
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

export default function ProfessionalRoleScreen({ navigation }) {

  const { onboardingData, updateField, addTranscript } = useOnboarding();
  const { t } = useI18n();

  const [selectedRole, setSelectedRole] = useState(
    onboardingData.professionalRole || ""
  );

  /*
    VOICE RECORDER
  */
  const {
    voiceState,
    transcript,
    extractedProfile,
    startRecording,
    stopRecording,
    playRecording,
    retakeRecording,
    submitRecording,
    confirmExtraction,
    rejectExtraction,
  } = useVoiceRecorder({
    onResult: ({ transcript: tx, extractedProfile: ep }) => {

      if (tx) addTranscript(tx);

      const role = ep?.rawRole || ep?.canonicalRole || "";
      if (role && role !== "other") {
        setSelectedRole(role);
        updateField("professionalRole", role);
        updateField("workerType", "professional");
      }
    },
  });

  /* TAP SELECT */
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    updateField("professionalRole", role);
    updateField("workerType", "professional");
  };

  /* CONTINUE */
  const handleContinue = () => {
    if (!selectedRole) {
      Alert.alert("Required", "Please select a professional role.");
      return;
    }
    navigation.navigate("Education");
  };

  return (
    <VoiceQuestionCard
      step={1}
      totalSteps={7}
      title={t("professionalRoleTitle") || "What professional role are you aiming for?"}
      subtitle={t("professionalRoleSubtitle") || "Tap a role below, or hold the mic and speak in your own language."}
      transcript={transcript}
      extractionLabel={t("detectedRole") || "Detected Role"}
      extractionDisplay={
        extractedProfile?.rawRole || extractedProfile?.canonicalRole || ""
      }
      options={PROFESSIONAL_ROLES.map(r => ({ value: r, label: t(`roles.${r}`) || r }))}
      selectedOption={selectedRole}
      onSelectOption={handleSelectRole}
      voiceState={voiceState}
      onStartRecording={startRecording}
      onStopRecording={stopRecording}
      onPlayRecording={playRecording}
      onRetakeRecording={retakeRecording}
      onSubmitRecording={submitRecording}
      onConfirm={confirmExtraction}
      onReject={rejectExtraction}
      onContinue={handleContinue}
    />
  );
}