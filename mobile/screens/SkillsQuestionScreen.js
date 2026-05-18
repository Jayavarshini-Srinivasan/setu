import { useState } from "react";
import { Alert } from "react-native";

import VoiceQuestionCard from "../components/VoiceQuestionCard";
import useVoiceRecorder from "../hooks/useVoiceRecorder";
import { useOnboarding } from "../context/OnboardingContext";
import { SKILLS_BY_ROLE } from "../constants/skills";
import { useI18n } from "../context/I18nContext";

export default function SkillsQuestionScreen({ navigation }) {

  const { onboardingData, updateField, addTranscript } = useOnboarding();
  const { t } = useI18n();

  const [selectedSkills, setSelectedSkills] = useState(
    onboardingData.skills || []
  );

  const role = onboardingData.canonicalRole || onboardingData.role || "";
  const skillOptions = SKILLS_BY_ROLE[role] || [];

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

      const extracted = ep?.skills || [];
      const merged    = [...new Set([...selectedSkills, ...extracted])];
      setSelectedSkills(merged);
      updateField("skills", merged);
    },
  });

  /* TOGGLE SKILL */
  const toggleSkill = (skill) => {
    let updated;
    if (selectedSkills.includes(skill)) {
      updated = selectedSkills.filter((s) => s !== skill);
    } else {
      updated = [...selectedSkills, skill];
    }
    setSelectedSkills(updated);
    updateField("skills", updated);
  };

  /* CONTINUE */
  const handleContinue = () => {
    if (selectedSkills.length === 0) {
      Alert.alert("Required", "Please select at least one skill.");
      return;
    }
    navigation.navigate("ExperienceQuestion");
  };

  const extractedSkillsDisplay =
    (extractedProfile?.skills || []).join(", ") || "";

  return (
    <VoiceQuestionCard
      step={2}
      totalSteps={5}
      title={t("whatSkills") || "What are your skills?"}
      subtitle={t("skillsSubtitle") || "Tap skills below or speak to auto-detect them."}
      transcript={transcript}
      extractionLabel="Detected Skills"
      extractionDisplay={extractedSkillsDisplay}
      options={skillOptions}
      selectedOptions={selectedSkills}
      onSelectOption={toggleSkill}
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