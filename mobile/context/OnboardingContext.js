import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

const OnboardingContext =
  createContext();

const getInitialOnboardingData = () => ({

  /*
    GLOBAL
  */
  workerType: "",

  language:
    "english",

  transcriptHistory:
    [],

  /*
    LABOUR
  */
  role: "",

  canonicalRole:
    "",

  skills: [],

  experience: "",

  age: "",

  phoneNumber: "",

  workRadius: "",

  expectedWage: "",

  previousWorkType: "",

  location: "",

  availability:
    "",

  preferredShift:
    "",

  /*
    PROFESSIONAL
  */
  professionalRole:
    "",

  email: "",

  experienceBand: "",

  education: {

    degree: "",

    institution:
      "",

    graduationYear:
      "",

    fieldOfStudy:
      "",
  },

  professionalSkills:
    [],

  experienceDetails:
    [],

  linkedin: "",

  github: "",

  portfolio: "",

  careerGoals:
    "",

  resumeSummary:
    "",

  certifications:
    [],

  preferredRoles:
    [],
});

export function OnboardingProvider({
  children,
}) {
  const { user } = useAuth();

  const [
    onboardingRefresh,
    setOnboardingRefresh,
  ] = useState(0);

  const [
    onboardingData,
    setOnboardingData,
  ] = useState(getInitialOnboardingData);

  /*
    UPDATE FIELD
  */
  const updateField =
    (
      field,
      value
    ) => {

      setOnboardingData(
        (prev) => ({
          ...prev,

          [field]:
            value,
        })
      );
    };

  /*
    ADD TRANSCRIPT
  */
  const addTranscript =
    (text) => {

      setOnboardingData(
        (prev) => ({

          ...prev,

          transcriptHistory: [
            ...prev.transcriptHistory,
            text,
          ],
        })
      );
    };

  /*
    FORCE REFRESH
  */
  const refreshOnboarding =
    () => {

      setOnboardingRefresh(
        (prev) =>
          prev + 1
      );
    };

  /*
    RESET
  */
  const resetOnboarding =
    () => {

      setOnboardingData(
        getInitialOnboardingData()
      );
    };

  useEffect(() => {
    resetOnboarding();
  }, [user?.uid]);

  return (

    <OnboardingContext.Provider
      value={{

        onboardingData,

        onboardingRefresh,

        updateField,

        addTranscript,

        resetOnboarding,

        refreshOnboarding,

        setFullOnboardingData: setOnboardingData,
      }}
    >

      {children}

    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {

  return useContext(
    OnboardingContext
  );
}


