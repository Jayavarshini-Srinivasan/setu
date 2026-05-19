import { useState } from "react";
import { Alert } from "react-native";

import VoiceQuestionCard from "../components/VoiceQuestionCard";
import useVoiceRecorder from "../hooks/useVoiceRecorder";
import { useOnboarding } from "../context/OnboardingContext";
import { useI18n } from "../context/I18nContext";

const ROLE_OPTIONS = [
  "auto_driver",
  "cab_driver",
  "truck_driver",
  "delivery_rider",
  "bus_driver",
  "delivery",
  "warehouse",
  "electrician",
  "construction",
];

export default function RoleQuestionScreen({ navigation }) {

  const { onboardingData, updateField, addTranscript } = useOnboarding();
  const { t } = useI18n();
  const [selectedRole, setSelectedRole] = useState(
    onboardingData.canonicalRole || ""
  );

  /*
    VOICE RECORDER
    onResult fires only after user taps "Looks Right" in CONFIRMED state
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

      const role = ep?.canonicalRole || ep?.role || "";
      if (role) {
        setSelectedRole(role);
        updateField("canonicalRole", role);
        updateField("role", role);
      }
    },
  });

  /* TAP SELECT */
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    updateField("canonicalRole", role);
    updateField("role", role);
  };

  /* CONTINUE */
  const handleContinue = () => {
    if (!selectedRole) {
      Alert.alert("Required", "Please select or speak your role.");
      return;
    }
    navigation.navigate("SkillsQuestion");
  };

  return (
    <VoiceQuestionCard
      step={1}
      totalSteps={5}
      title={t("whatWorkDoYouDo") || "What work do you do?"}
      subtitle={t("roleSubtitle") || "Tap a role below, or hold the mic and speak in your own language."}
      transcript={transcript}
      extractionLabel={t("detectedRole") || "Detected Role"}
      extractionDisplay={extractedProfile?.canonicalRole || extractedProfile?.role || ""}
      options={ROLE_OPTIONS.map(r => ({ value: r, label: t(`roles.${r}`) || r }))}
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