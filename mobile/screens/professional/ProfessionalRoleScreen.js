import {
  useState,
} from "react";

import {
  Alert,
} from "react-native";

import VoiceQuestionCard from "../../components/VoiceQuestionCard";

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
    SELECT ROLE
  */
  const handleSelectRole =
    (role) => {

      setSelectedRole(
        role
      );

      /*
        SAVE ROLE
      */
      updateField(
        "professionalRole",
        role
      );

      /*
        USER TYPE
      */
      updateField(
        "workerType",
        "professional"
      );
    };

  /*
    CONTINUE
  */
  const handleContinue =
    () => {

      if (!selectedRole) {

        Alert.alert(
          "Required",
          "Please select a professional role"
        );

        return;
      }

      navigation.navigate(
        "Education"
      );
    };

  return (

    <VoiceQuestionCard

      title="What professional role are you aiming for?"

      subtitle="Choose the role closest to your career goals."

      transcript=""

      options={
        professionalRoles
      }

      selectedOption={
        selectedRole
      }

      onSelectOption={
        handleSelectRole
      }

      /*
        VOICE LATER
      */
      onVoicePress={() => {}}

      onContinue={
        handleContinue
      }
    />
  );
}