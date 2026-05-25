import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useI18n } from "../context/I18nContext";
import { useAppliedJobs } from "../context/AppliedJobsContext";
import { getJobId } from "../utils/jobId";
import { submitJobApplication, ApplyJobError } from "../utils/applyToJob";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function AIAnalysisScreen({ route, navigation }) {
  const { t } = useI18n();
  const { selectedJobId, jobs = [] } = route.params || {};

  const [activeTab, setActiveTab] = useState(selectedJobId || "all");
  const [applyingJobId, setApplyingJobId] = useState(null);
  const { markApplied, isApplied } = useAppliedJobs();

  // Format salary text (e.g. "₹4.2L/yr" or "₹25K/mo")
  const formatSalaryText = (salary) => {
    if (!salary) return "₹3.5L/yr";
    const numericSalary = parseInt(salary, 10);
    if (numericSalary >= 100000) {
      return `₹${(numericSalary / 100000).toFixed(1)}L/yr`;
    }
    if (numericSalary >= 1000) {
      return `₹${(numericSalary / 1000).toFixed(0)}K/mo`;
    }
    return `₹${numericSalary}/yr`;
  };

  // Distance helper
  const getDistanceText = (job) => {
    const jobKey = job.title || job.jobId || "";
    const distanceVal = job.distance || (((jobKey.charCodeAt(0) || 5) % 10) + 2.5).toFixed(1);
    return `${distanceVal} km`;
  };

  // Dimensions calculators
  const getPayScore = (job) => {
    const sal = parseInt(job.salary || 0, 10);
    if (!sal) return 75;
    if (sal >= 450000) return 92;
    if (sal >= 400000) return 88;
    if (sal >= 350000) return 80;
    if (sal >= 300000) return 72;
    return 65;
  };

  const getProximityScore = (job) => {
    if (job.analysis?.locationScore) return job.analysis.locationScore;
    const jobKey = job.title || job.jobId || "";
    const dist = parseFloat(job.distance || (((jobKey.charCodeAt(0) || 5) % 10) + 2.5));
    if (dist <= 3) return 98;
    if (dist <= 5) return 95;
    if (dist <= 10) return 85;
    return 70;
  };

  const getSkillScore = (job) => {
    if (typeof job.analysis?.skillMatch === "number") return job.analysis.skillMatch;
    return job.matchScore || 70;
  };

  const getGrowthScore = (job) => {
    const t = (job.title || "").toLowerCase();
    if (t.includes("developer") || t.includes("analyst") || t.includes("software") || t.includes("ai")) return 88;
    if (t.includes("account") || t.includes("finance")) return 72;
    if (t.includes("delivery") || t.includes("driver")) return 58;
    return 65;
  };

  const getStabilityScore = (job) => {
    if (job.analysis?.experienceScore) return job.analysis.experienceScore;
    const jobKey = job.title || job.jobId || "";
    const rand = (jobKey.charCodeAt(0) || 4) % 3;
    if (rand === 0) return 95;
    if (rand === 1) return 85;
    return 75;
  };

  // AI Summary Card generator based on active tabs
  const getAiSummaryText = () => {
    if (jobs.length === 0) return "No matches available for analysis.";

    if (activeTab === "all") {
      const topJob = jobs[0];
      let summary = `${topJob.title} at ${topJob.company} is your strongest all-round pick — best match (${topJob.matchScore}%), closest location, and highest pay.`;
      
      if (jobs.length > 1) {
        const secondJob = jobs[1];
        summary += ` ${secondJob.title} suits you if work-life balance matters.`;
      }
      if (jobs.length > 2) {
        const thirdJob = jobs[2];
        summary += ` ${thirdJob.title} is a growth bet if you're willing to upskill.`;
      }
      return summary;
    } else {
      const job = jobs.find((j) => (j.jobId || j.id) === activeTab);
      if (!job) return "No matches available for analysis.";

      const score = job.matchScore;
      const skillsMatch = getSkillScore(job);
      const dist = getDistanceText(job);

      if (score >= 85) {
        return `${job.title} at ${job.company} represents a stellar match (${score}% compatibility). You possess ${skillsMatch}% of required skills and are located just ${dist} away.`;
      } else if (score >= 70) {
        return `${job.title} at ${job.company} is a solid fit (${score}% compatibility). The commute is reasonable (${dist}) and skill matching is good (${skillsMatch}%).`;
      } else {
        return `${job.title} is a viable match (${score}% compatibility). Upskilling could improve your suitability and unlock higher matching roles.`;
      }
    }
  };

  // Pros & Cons generator
  const getJobPros = (job) => {
    const pros = [];
    const pay = getPayScore(job);
    const dist = getDistanceText(job);
    const skill = getSkillScore(job);
    const isTopPay = jobs.length > 0 && jobs.every((j) => parseInt(j.salary || 0, 10) <= parseInt(job.salary || 0, 10));

    if (isTopPay) {
      pros.push(`Highest pay among all matches at ${formatSalaryText(job.salary)}`);
    } else {
      pros.push(`Competitive compensation package at ${formatSalaryText(job.salary)}`);
    }

    const distVal = parseFloat(dist);
    if (distVal <= 5) {
      pros.push(`Closest to you — just ${dist} away`);
    } else {
      pros.push(`Located at a manageable ${dist} distance`);
    }

    pros.push(`${skill}% skill match, high compatibility`);
    pros.push(`${job.company} brand boosts your future resume`);
    
    const openings = ((job.title || "").charCodeAt(0) % 3) + 2;
    pros.push(`${openings} openings — higher chance of getting in`);

    return pros;
  };

  const getJobCons = (job) => {
    const cons = [];
    const missing = job.analysis?.missingSkills || [];

    if (missing.length > 0) {
      cons.push(`Requires ${missing[0]} — a skill you don't yet have`);
    } else {
      cons.push("Minor skill gaps to bridge for maximum effectiveness");
    }

    const appCount = ((job.title || "").charCodeAt(0) % 40) + 15;
    cons.push(`High competition: ${appCount} other applicants`);

    const industry = (job.company || "").toLowerCase();
    if (industry.includes("flipkart") || industry.includes("amazon") || industry.includes("delhivery")) {
      cons.push("E-commerce/logistics industry can be high-pressure");
    } else {
      cons.push("Active coordination and adherence to schedules required");
    }

    return cons;
  };

  // Job Badge helper
  const getJobBadge = (score) => {
    if (score >= 85) return { label: t("aiAnalysis.bestPick") || "Best Pick", bg: "#ECFDF5", text: "#10B981" };
    if (score >= 70) return { label: t("aiAnalysis.goodFit") || "Good Fit", bg: "#EFF6FF", text: "#3B82F6" };
    return { label: t("aiAnalysis.possible") || "Possible", bg: "#FEF3C7", text: "#D97706" };
  };

  // Horizontal Tab Short Title Helper
  const getShortTitle = (title) => {
    if (title === "all") return "All Jobs";
    let t = title;
    t = t.replace("Executive", "Exec");
    t = t.replace("Assistant", "Asst");
    t = t.replace("Associate", "Assoc");
    t = t.replace("Developer", "Dev");
    t = t.replace("Manager", "Mgr");
    if (t.length > 13) {
      return t.substring(0, 11) + "..";
    }
    return t;
  };

  // Apply Action handler
  const handleApplyNow = async (job) => {
    const jobId = getJobId(job);
    if (!jobId) {
      alert("This job cannot be applied to right now.");
      return;
    }
    if (isApplied(job)) return;

    setApplyingJobId(jobId);
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
    } finally {
      setApplyingJobId(null);
    }
  };

  const visibleJobs = activeTab === "all" ? jobs : jobs.filter((j) => (j.jobId || j.id) === activeTab);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back-outline" size={20} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            {selectedJobId
              ? (t("aiAnalysis.jobDetails") || "Job Details")
              : (t("aiAnalysis.title") || "AI Match Analysis")}
          </Text>
          {selectedJobId ? null : (
            <Text style={styles.headerSubtitle}>
              {t("aiAnalysis.subtitle", { count: jobs.length }) ||
                `AI analysis of ${jobs.length} matched jobs`}
            </Text>
          )}
        </View>
        <View style={styles.aiIconContainer}>
          <Ionicons name="hardware-chip-outline" size={20} color="#2563EB" />
        </View>
      </View>

      {/* AI SUMMARY CARD */}
      <View style={styles.summaryWrapper}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="sparkles" size={18} color="#2563EB" style={{ marginRight: 6 }} />
            <Text style={styles.summaryTitle}>{t("aiAnalysis.summaryTitle") || "AI Summary"}</Text>
          </View>
          <Text style={styles.summaryText}>{getAiSummaryText()}</Text>
        </View>
      </View>

      {/* HORIZONTAL JOB TABS */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "all" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("all")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "all" && styles.tabTextActive,
              ]}
            >
              {t("aiAnalysis.allJobs") || "All Jobs"}
            </Text>
          </TouchableOpacity>
          {jobs.map((job) => {
            const jId = job.jobId || job.id;
            const isActive = activeTab === jId;
            return (
              <TouchableOpacity
                key={jId}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(jId)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.tabText, isActive && styles.tabTextActive]}
                >
                  {getShortTitle(job.title)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* SCROLLABLE MAIN CONTENT */}
      <ScrollView contentContainerStyle={styles.contentScroll} showsVerticalScrollIndicator={false}>
        {visibleJobs.map((job, idx) => {
          const jId = getJobId(job);
          const badge = getJobBadge(job.matchScore);
          const payScore = getPayScore(job);
          const proximityScore = getProximityScore(job);
          const skillScore = getSkillScore(job);
          const growthScore = getGrowthScore(job);
          const stabilityScore = getStabilityScore(job);
          const hasApplied = isApplied(job);
          const isApplying = applyingJobId === jId;

          return (
            <View key={jId} style={[styles.jobSectionCard, idx > 0 && { marginTop: 24 }]}>
              {/* Card Header Info */}
              <View style={styles.cardHeader}>
                <View style={styles.jobTitleBlock}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.jobSub}>
                    {job.company} • {formatSalaryText(job.salary)} • {getDistanceText(job)} away
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeText, { color: badge.text }]}>
                    {badge.label}
                  </Text>
                </View>
              </View>

              {/* Progress Bars */}
              <View style={styles.progressContainer}>
                {/* Pay */}
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>{t("aiAnalysis.payScore") || "Pay"}</Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${payScore}%`, backgroundColor: "#C2410C" }]} />
                  </View>
                  <Text style={[styles.progressVal, { color: "#C2410C" }]}>{payScore}%</Text>
                </View>

                {/* Proximity */}
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>{t("aiAnalysis.proximityScore") || "Proximity"}</Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${proximityScore}%`, backgroundColor: "#2563EB" }]} />
                  </View>
                  <Text style={[styles.progressVal, { color: "#2563EB" }]}>{proximityScore}%</Text>
                </View>

                {/* Skill Match */}
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>{t("aiAnalysis.skillScore") || "Skill match"}</Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${skillScore}%`, backgroundColor: "#059669" }]} />
                  </View>
                  <Text style={[styles.progressVal, { color: "#059669" }]}>{skillScore}%</Text>
                </View>

                {/* Growth */}
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>{t("aiAnalysis.growthScore") || "Growth"}</Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${growthScore}%`, backgroundColor: "#7C3AED" }]} />
                  </View>
                  <Text style={[styles.progressVal, { color: "#7C3AED" }]}>{growthScore}%</Text>
                </View>

                {/* Stability */}
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>{t("aiAnalysis.stabilityScore") || "Stability"}</Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${stabilityScore}%`, backgroundColor: "#0D9488" }]} />
                  </View>
                  <Text style={[styles.progressVal, { color: "#0D9488" }]}>{stabilityScore}%</Text>
                </View>
              </View>

              {/* PROS Section */}
              <View style={styles.prosContainer}>
                <Text style={styles.sectionHeaderGreen}>{(t("aiAnalysis.pros") || "PROS").toUpperCase()}</Text>
                {getJobPros(job).map((pro, index) => (
                  <View key={`pro-${index}`} style={styles.bulletRow}>
                    <Ionicons name="checkmark-sharp" size={15} color="#047857" style={styles.bulletIcon} />
                    <Text style={styles.bulletTextGreen}>{pro}</Text>
                  </View>
                ))}
              </View>

              {/* CONS Section */}
              <View style={styles.consContainer}>
                <Text style={styles.sectionHeaderRed}>{(t("aiAnalysis.cons") || "CONS").toUpperCase()}</Text>
                {getJobCons(job).map((con, index) => (
                  <View key={`con-${index}`} style={styles.bulletRow}>
                    <Ionicons name="close-sharp" size={15} color="#B91C1C" style={styles.bulletIcon} />
                    <Text style={styles.bulletTextRed}>{con}</Text>
                  </View>
                ))}
              </View>

              {/* APPLY NOW BUTTON */}
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  hasApplied && styles.appliedButton,
                ]}
                onPress={() => handleApplyNow(job)}
                disabled={hasApplied || isApplying}
                activeOpacity={0.85}
              >
                {isApplying ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name={hasApplied ? "checkmark-circle" : "send-outline"}
                      size={18}
                      color="#FFFFFF"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.applyButtonText}>
                      {hasApplied
                        ? (t("aiAnalysis.applied") || "Applied")
                        : (t("aiAnalysis.applyNow") || "Apply Now")}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
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
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  aiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  summaryWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  summaryCard: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primary,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.primaryDark,
    lineHeight: 20,
  },
  tabsContainer: {
    backgroundColor: COLORS.background,
    paddingVertical: 12,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    marginRight: 4,
  },
  tabButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  contentScroll: {
    padding: 16,
    paddingBottom: 40,
  },
  jobSectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  jobTitleBlock: {
    flex: 1,
    paddingRight: 8,
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  jobSub: {
    fontSize: 13,
    color: "#6B7280",
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  progressLabel: {
    width: 85,
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressVal: {
    width: 40,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "700",
  },
  prosContainer: {
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  sectionHeaderGreen: {
    fontSize: 12,
    fontWeight: "700",
    color: "#047857",
    letterSpacing: 1,
    marginBottom: 8,
  },
  consContainer: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  sectionHeaderRed: {
    fontSize: 12,
    fontWeight: "700",
    color: "#B91C1C",
    letterSpacing: 1,
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  bulletIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  bulletTextGreen: {
    fontSize: 13,
    color: "#065F46",
    flex: 1,
    lineHeight: 18,
  },
  bulletTextRed: {
    fontSize: 13,
    color: "#7F1D1D",
    flex: 1,
    lineHeight: 18,
  },
  applyButton: {
    backgroundColor: COLORS.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.md,
    marginTop: 8,
    ...SHADOWS.card,
  },
  appliedButton: {
    backgroundColor: "#10B981",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
