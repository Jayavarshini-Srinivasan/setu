import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { doc, getDoc } from "firebase/firestore";

import { useAuth } from "./AuthContext";
import { db } from "../services/firebase";

const OnboardingContext =
  createContext();

const emptyEducation = () => ({
  degree: "",
  institution:
    "",
  graduationYear:
    "",
  fieldOfStudy:
    "",
});

const getInitialOnboardingData = () => ({

  /*
    GLOBAL
  */
  workerType: "",

  language:
    "english",

  transcriptHistory:
    [],

  fullName: "",

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

  transportAccess:
    false,

  /*
    PROFESSIONAL
  */
  professionalRole:
    "",

  email: "",

  experienceBand: "",

  education: {

    ...emptyEducation(),
  },

  professionalSkills:
    [],

  experienceDetails:
    [],

  linkedin: "",

  github: "",

  portfolio: "",

  careerGoal:
    "",

  expectedSalary:
    null,

  resumeSummary:
    "",

  certifications:
    [],

  preferredRoles:
    [],
});

export const mapUserDocToOnboardingData = (
  userData,
  authUser
) => {
  const profileData =
    userData?.profile || {};

  const fullName =
    profileData.fullName ||
    profileData.name ||
    userData?.fullName ||
    "";

  const resumeSummary =
    profileData.resumeSummary ||
    (fullName && profileData.professionalRole
      ? `${fullName}|${profileData.professionalRole}`
      : fullName);

  const professionalSkills =
    profileData.professionalSkills ||
    profileData.skills ||
    [];

  return {
    ...getInitialOnboardingData(),

    workerType:
      userData?.workerType || "",

    language:
      userData?.language || "",

    transcriptHistory:
      profileData.transcriptHistory || [],

    fullName,

    role:
      profileData.role || "",

    canonicalRole:
      profileData.canonicalRole ||
      profileData.role ||
      "",

    skills:
      profileData.skills || [],

    experience:
      profileData.experience ?? "",

    age:
      profileData.age != null
        ? String(profileData.age)
        : "",

    phoneNumber:
      profileData.phoneNumber ||
      authUser?.phoneNumber ||
      "",

    workRadius:
      profileData.workRadius || "",

    expectedWage:
      profileData.expectedWage || "",

    previousWorkType:
      profileData.previousWorkType || "",

    location:
      profileData.location || "",

    availability:
      profileData.labourData?.availability ||
      profileData.availability ||
      "",

    preferredShift:
      profileData.labourData?.preferredShift ||
      profileData.preferredShift ||
      "",

    transportAccess:
      profileData.labourData?.transportAccess ??
      profileData.transportAccess ??
      false,

    professionalRole:
      profileData.professionalRole ||
      profileData.canonicalRole ||
      "",

    email:
      profileData.email ||
      userData?.email ||
      authUser?.email ||
      "",

    experienceBand:
      profileData.experienceBand || "",

    education: {
      ...emptyEducation(),
      ...(profileData.education || {}),
    },

    professionalSkills,

    experienceDetails:
      profileData.experienceDetails || [],

    linkedin:
      profileData.linkedin || "",

    github:
      profileData.github || "",

    portfolio:
      profileData.portfolio || "",

    careerGoal:
      profileData.careerGoal || "",

    expectedSalary:
      profileData.expectedSalary || null,

    resumeSummary,

    certifications:
      profileData.certifications || [],

    preferredRoles:
      profileData.preferredRoles || [],
  };
};

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

  const [
    onboardingLoading,
    setOnboardingLoading,
  ] = useState(false);

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
    let cancelled = false;

    const hydrateOnboarding = async () => {
      if (!user?.uid) {
        resetOnboarding();
        setOnboardingLoading(false);
        return;
      }

      setOnboardingLoading(true);

      try {
        const snap = await getDoc(
          doc(db, "users", user.uid)
        );

        if (cancelled) return;

        if (snap.exists()) {
          setOnboardingData(
            mapUserDocToOnboardingData(
              snap.data(),
              user
            )
          );
        } else {
          resetOnboarding();
        }
      } catch (error) {
        console.log(
          "[OnboardingContext] hydrate:",
          error
        );
      } finally {
        if (!cancelled) {
          setOnboardingLoading(false);
        }
      }
    };

    hydrateOnboarding();

    return () => {
      cancelled = true;
    };
  }, [
    user?.uid,
    onboardingRefresh,
  ]);

  return (

    <OnboardingContext.Provider
      value={{

        onboardingData,

        onboardingLoading,

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


