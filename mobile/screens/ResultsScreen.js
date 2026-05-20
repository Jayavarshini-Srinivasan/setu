import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import API from "../services/api";

import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useI18n } from "../context/I18nContext";

import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import JobCard from "../components/JobCard";

import { getErrorMessage } from "../utils/errorHandler";
import useAsync from "../hooks/useAsync";

export default function ResultsScreen({ navigation }) {
  const { t, language } = useI18n();

  const loadMatches = async () => {

    const currentUser = auth.currentUser;
    if (!currentUser) return [];

    /* ── Profile ── */
    const userRef  = doc(db, "users", currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User profile missing");
    }

    const userData = userSnap.data();
    const profile  = userData.profile || {};

    /* ── Worker type ── */
    const isProfessional = userData.workerType === "professional";

    const role = isProfessional
      ? (profile.professionalRole || "")
      : (profile.canonicalRole || profile.role || "");

    const skills = isProfessional
      ? (Array.isArray(profile.professionalSkills) ? profile.professionalSkills : [])
      : (Array.isArray(profile.skills) ? profile.skills : []);

    const experience = isProfessional
      ? (profile.experienceDetails?.length || 0)
      : (profile.experience || 0);

    const payload = {
      workerId:      currentUser.uid,
      role,
      skills,
      location:      profile.location || "",
      experience,
      isProfessional,
      language,
    };

    /* ── Match API ── */
    try {
      const response = await API.post("/match", payload);
      return {
        jobs:          response.data,
        isProfessional,
        workerProfile: payload,
      };
    } catch (error) {
      console.log("LOAD MATCH ERROR", error?.message);
      throw error;
    }
  };

  /* ── Async state ── */
  const { data, loading, error } = useAsync(loadMatches, []);

  const jobs          = data?.jobs || [];
  const isProfessional = data?.isProfessional || false;
  const workerProfile  = data?.workerProfile || {};

  /* ── Apply to job ── */
  const handleApply = async (job) => {
    try {
      const token    = await auth.currentUser.getIdToken();
      const workerId = auth.currentUser.uid;

      await API.post(
        "/apply",
        { workerId, jobId: job.jobId, matchScore: job.matchScore },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Application submitted successfully");
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  /*
    GENERATE CAREER PATH
    Builds matchContext from the live results and navigates to
    LearningPath Stack screen. Only shown for professionals.
  */
  const handleGenerateCareerPath = () => {

    /* Top matched job */
    const topJob = jobs[0] || null;

    /* Union of missing skills across ALL matched jobs */
    const allMissingSkillsSet = new Set();
    jobs.forEach((job) => {
      (job.missingSkills || []).forEach((s) => allMissingSkillsSet.add(s));
    });

    const matchContext = {
      topJob,
      allMissingSkills:  [...allMissingSkillsSet],
      currentMatchScore: topJob?.matchScore || 0,
      role:              workerProfile.role,
      skills:            workerProfile.skills,
    };

    navigation.navigate("LearningPath", { matchContext });
  };

  /* ── Render states ── */
  if (loading) return <LoadingSpinner text={t("loadingJobs") || "Finding your matches…"} />;
  if (error)   return <ErrorState message={getErrorMessage(error)} />;

  if (jobs.length === 0) {
    return (
      <EmptyState
        title={t("noMatches") || "No Matches Found"}
        description={t("noMatchesDesc") || "No matching jobs are available right now. Try updating your profile."}
      />
    );
  }

  const renderItem = ({ item }) => (
    <JobCard job={item} onApply={handleApply} />
  );

  return (
    <View style={styles.container}>

      <FlatList
        data={jobs}
        keyExtractor={(item, index) => `${item.jobId || item.id}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.header}>
            {jobs.length} {t("matchesFound") || (jobs.length !== 1 ? "matches found" : "match found")}
          </Text>
        }
        ListFooterComponent={

          /* ── Career Path CTA (professionals only) ── */
          isProfessional && jobs.length > 0 ? (
            <TouchableOpacity
              style={styles.careerPathButton}
              onPress={handleGenerateCareerPath}
              activeOpacity={0.85}
            >
              <Text style={styles.careerPathIcon}>🎯</Text>
              <View>
                <Text style={styles.careerPathTitle}>{t("generateCareerPath") || "Generate My Career Path"}</Text>
                <Text style={styles.careerPathSubtitle}>
                  {t("careerPathSubtitle") || "AI-powered roadmap based on your match gaps"}
                </Text>
              </View>
            </TouchableOpacity>
          ) : null
        }
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },

  list: {
    padding: 16,
    paddingBottom: 32,
  },

  header: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  careerPathButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#111827",
    padding: 20,
    borderRadius: 18,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },

  careerPathIcon: {
    fontSize: 32,
  },

  careerPathTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 3,
  },

  careerPathSubtitle: {
    color: "#9CA3AF",
    fontSize: 13,
  },
});