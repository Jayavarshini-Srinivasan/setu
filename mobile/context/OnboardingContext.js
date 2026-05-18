import {
  createContext,
  useContext,
  useState,
} from "react";

const OnboardingContext =
  createContext();

export function OnboardingProvider({
  children,
}) {

  const [
    onboardingRefresh,
    setOnboardingRefresh,
  ] = useState(0);

  const [
    onboardingData,
    setOnboardingData,
  ] = useState({

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

    experience: 0,

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

    education: {

      degree: "",

      institution:
        "",

      graduationYear:
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

      setOnboardingData({

        workerType:
          "",

        language:
          "english",

        transcriptHistory:
          [],

        role: "",

        canonicalRole:
          "",

        skills: [],

        experience: 0,

        location: "",

        availability:
          "",

        preferredShift:
          "",

        professionalRole:
          "",

        education: {

          degree: "",

          institution:
            "",

          graduationYear:
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
    };

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


