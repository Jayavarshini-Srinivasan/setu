import { useState, useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { COLORS, BORDER_RADIUS } from "../constants/theme";

import API from "../services/api";

import { doc, getDoc } from "firebase/firestore";
import { useAppliedJobs } from "../context/AppliedJobsContext";
import { useAuth } from "../context/AuthContext";
import { getJobId } from "../utils/jobId";
import { submitJobApplication, ApplyJobError } from "../utils/applyToJob";
import { db } from "../services/firebase";
import { useI18n } from "../context/I18nContext";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import JobCard from "../components/JobCard";

import { getErrorMessage } from "../utils/errorHandler";
import useAsync from "../hooks/useAsync";

export default function ResultsScreen({ navigation }) {
  const { t, language } = useI18n();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const topInset = insets.top + 12;
  const { appliedCount, markApplied, isApplied } = useAppliedJobs();
  const { user } = useAuth();

  const loadMatches = async () => {

    const currentUser = user;
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
  const { data, loading, error } = useAsync(loadMatches, [user?.uid, language]);

  const jobs          = data?.jobs || [];
  const isProfessional = data?.isProfessional || false;
  const workerProfile  = data?.workerProfile || {};

  useEffect(() => {
    const justApplied = route.params?.justAppliedJobId;
    if (justApplied) {
      markApplied(justApplied);
      navigation.setParams({ justAppliedJobId: undefined });
    }
  }, [route.params?.justAppliedJobId, markApplied, navigation]);

  /* ── Apply to job ── */
  const handleApply = async (job) => {
    const jobId = getJobId(job);
    try {
      const result = await submitJobApplication(job);
      markApplied(result.jobId);
      if (result.alreadyApplied) {
        return;
      }
      navigation.navigate("ApplySuccess", {
        jobTitle: job.title,
        company: job.company,
        jobId: result.jobId,
      });
    } catch (error) {
      if (error instanceof ApplyJobError) {
        alert(error.message);
      } else {
        alert(error?.message || "Could not apply to this job.");
      }
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

  /* ── State for local filter ── */
  const [filterTab, setFilterTab] = useState("all");

  const getFilteredJobs = () => {
    if (filterTab === "best") {
      return jobs.filter(j => j.matchScore >= 80);
    }
    if (filterTab === "near") {
      // Sort by real location/proximity score from backend (higher = closer/better match)
      return [...jobs].sort((a, b) => {
        const proxA = a.metrics?.proximity ?? a.analysis?.locationScore ?? 0;
        const proxB = b.metrics?.proximity ?? b.analysis?.locationScore ?? 0;
        return proxB - proxA;
      });
    }
    return jobs;
  };

  const filteredJobs = getFilteredJobs();

  /* ── Render states ── */
  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <LoadingSpinner text={t("loadingJobs") || "Finding your matches…"} />
      </View>
    );
  }
  if (error) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <ErrorState message={getErrorMessage(error)} />
      </View>
    );
  }

  if (jobs.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <EmptyState
          title={t("noMatches") || "No Matches Found"}
          description={t("noMatchesDesc") || "No matching jobs are available right now. Try updating your profile."}
        />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <JobCard
      job={item}
      isApplied={isApplied(item)}
      onAnalyze={(job) => {
        navigation.navigate("AIAnalysis", {
          selectedJobId: getJobId(job),
          jobs,
        });
      }}
    />
  );

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("Home")}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back-outline" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("jobMatches") || "Job Matches"}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.filterTabsScrollView}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsContainer}
        >
          {/* <TouchableOpacity
            style={[styles.filterTab, filterTab === "all" && styles.filterTabActive]}
            onPress={() => setFilterTab("all")}
          >
            <Text style={[styles.filterTabText, filterTab === "all" && styles.filterTabTextActive]}>
              All ({jobs.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filterTab === "best" && styles.filterTabActive]}
            onPress={() => setFilterTab("best")}
          >
            <Text style={[styles.filterTabText, filterTab === "best" && styles.filterTabTextActive]}>
              Best Match
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filterTab === "near" && styles.filterTabActive]}
            onPress={() => setFilterTab("near")}
          >
            <Text style={[styles.filterTabText, filterTab === "near" && styles.filterTabTextActive]}>
              Near Me
            </Text>
          </TouchableOpacity> */}
        </ScrollView>
      </View>

      <FlatList
        data={filteredJobs}
        keyExtractor={(item, index) => `${getJobId(item)}-${index}`}
        renderItem={renderItem}
        extraData={appliedCount}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          isProfessional && jobs.length > 0 ? (
            <TouchableOpacity
              style={styles.careerPathButton}
              onPress={handleGenerateCareerPath}
              activeOpacity={0.85}
            >
              <Text style={styles.careerPathIcon}>🎯</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.careerPathTitle}>
                  {t("generateCareerPath") || "Generate My Career Path"}
                </Text>
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
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  headerSpacer: { width: 40 },
  filterTabsScrollView: {
    flexGrow: 0,
  },
  filterTabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  filterTab: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  filterTabActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  careerPathButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: COLORS.primaryDark,
    padding: 20,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: 12,
  },
  careerPathIcon: { fontSize: 32 },
  careerPathTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 3,
  },
  careerPathSubtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
  },
});
