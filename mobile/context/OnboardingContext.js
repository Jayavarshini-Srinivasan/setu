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
    onboardingData,
    setOnboardingData,
  ] = useState({

    workerType: "",

    language: "english",

    role: "",

    canonicalRole: "",

    skills: [],

    experience: 0,

    location: "",

    availability: "",

    preferredShift: "",

    education: "",

    certifications: [],

    preferredRoles: [],

    transcriptHistory: [],
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
    RESET
  */
  const resetOnboarding =
    () => {

      setOnboardingData({

        workerType: "",

        language:
          "english",

        role: "",

        canonicalRole: "",

        skills: [],

        experience: 0,

        location: "",

        availability: "",

        preferredShift: "",

        education: "",

        certifications: [],

        preferredRoles: [],

        transcriptHistory:
          [],
      });
    };

  return (

    <OnboardingContext.Provider
      value={{

        onboardingData,

        updateField,

        addTranscript,

        resetOnboarding,
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