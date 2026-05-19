import { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

import API from "../../services/api";
import { auth } from "../../services/firebase";
import { useI18n } from "../../context/I18nContext";


const fmt = (n) => n?.toLocaleString("en-IN") ?? "–";

const PHASE_COLORS = {
  Foundation:   { bg: "#EFF6FF", text: "#1D4ED8", badge: "#BFDBFE" },
  "Core Growth":{ bg: "#F0FDF4", text: "#15803D", badge: "#BBF7D0" },
  Advanced:     { bg: "#FFF7ED", text: "#C2410C", badge: "#FED7AA" },
};

function PhaseChip({ phase, t }) {
  const colors = PHASE_COLORS[phase] || PHASE_COLORS.Foundation;
  return (
    <View style={[styles.phaseChip, { backgroundColor: colors.badge }]}>
      <Text style={[styles.phaseChipText, { color: colors.text }]}>{t(phase) || phase}</Text>
    </View>
  );
}

function ScoreBar({ value, max = 100, color = "#E85D04" }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

export default function LearningPathScreen({ route }) {

  const { matchContext } = route?.params || {};
  const { t, language } = useI18n();

  const [loading, setLoading]   = useState(true);
  const [plan,    setPlan]      = useState(null);

  useEffect(() => { fetchPlan(); }, []);

  const fetchPlan = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("Not authenticated");

      const response = await API.post("/learning/path", {
        userId,
        matchContext: matchContext || {},
        language,
      });

      setPlan(response.data);
    } catch (err) {
      console.error("[LearningPathScreen]", err);
      Alert.alert("Error", "Could not generate your career path. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E85D04" />
        <Text style={styles.loadingLabel}>{t("buildingRoadmap") || "Building your career roadmap…"}</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No career path data available.</Text>
      </View>
    );
  }

  const {
    role,
    targetRole,
    currentAssessment,
    skillGaps,
    roadmap,
    totalWeeks,
    currentMatchScore,
    projectedMatchScore,
    matchImprovementDelta,
    salary,
    topJob,
  } = plan;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* ── HEADER ── */}
      <View style={styles.headerBlock}>
        <Text style={styles.headerLabel}>{t("careerIntelligenceTitle") || "Career Intelligence"}</Text>
        <Text style={styles.headerRole}>{t(`roles.${role}`) || role}</Text>
        <Text style={styles.headerTarget}>↗ Target: {t(`roles.${targetRole}`) || targetRole}</Text>
      </View>

      {/* ── CURRENT ASSESSMENT ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Assessment</Text>

        <View style={styles.assessmentRow}>
          <View style={styles.assessmentItem}>
            <Text style={styles.assessmentValue}>{currentMatchScore}%</Text>
            <Text style={styles.assessmentLabel}>Best Match</Text>
          </View>
          <View style={styles.assessmentItem}>
            <Text style={styles.assessmentValue}>{currentAssessment?.skillCount || 0}</Text>
            <Text style={styles.assessmentLabel}>Skills</Text>
          </View>
          <View style={styles.assessmentItem}>
            <Text style={styles.assessmentValue}>{skillGaps?.length || 0}</Text>
            <Text style={styles.assessmentLabel}>Skill Gaps</Text>
          </View>
        </View>

        {topJob && (
          <View style={styles.topJobCard}>
            <Text style={styles.topJobLabel}>🏆  Top Matched Job</Text>
            <Text style={styles.topJobTitle}>{topJob.title}</Text>
            <Text style={styles.topJobMeta}>
              {topJob.location} · ₹{fmt(topJob.salary)}/yr · {topJob.matchScore}% match
            </Text>
          </View>
        )}
      </View>

      {/* ── PROJECTIONS ── */}
      <View style={styles.projectionCard}>

        <Text style={styles.projectionTitle}>After completing this path</Text>

        <View style={styles.projectionRow}>
          <View style={styles.projectionItem}>
            <Text style={styles.projectionValue}>+{matchImprovementDelta}%</Text>
            <Text style={styles.projectionItemLabel}>Match Score</Text>
          </View>
          <View style={styles.projectionDivider} />
          <View style={styles.projectionItem}>
            <Text style={styles.projectionValue}>~{totalWeeks}w</Text>
            <Text style={styles.projectionItemLabel}>Timeline</Text>
          </View>
          <View style={styles.projectionDivider} />
          <View style={styles.projectionItem}>
            <Text style={styles.projectionValue}>
              ₹{fmt(Math.round((salary?.projectedEstimate || 0) / 100000))}L
            </Text>
            <Text style={styles.projectionItemLabel}>Est. CTC</Text>
          </View>
        </View>

        {/* Match score bar */}
        <View style={{ marginTop: 16 }}>
          <View style={styles.barLabelRow}>
            <Text style={styles.barLabelText}>Current  {currentMatchScore}%</Text>
            <Text style={[styles.barLabelText, { color: "#16A34A" }]}>
              Projected  {projectedMatchScore}%
            </Text>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${currentMatchScore}%`, backgroundColor: "#9CA3AF" }]} />
          </View>
          <View style={[styles.barTrack, { marginTop: 6 }]}>
            <View style={[styles.barFill, { width: `${projectedMatchScore}%`, backgroundColor: "#16A34A" }]} />
          </View>
        </View>

      </View>

      {/* ── SKILL GAP ANALYSIS ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skill Gap Analysis</Text>
        <Text style={styles.sectionSubtitle}>
          Derived from your real job match failures — not generic advice.
        </Text>

        <View style={styles.gapChips}>
          {(skillGaps || []).map((skill, i) => (
            <View key={i} style={styles.gapChip}>
              <Text style={styles.gapChipText}>{t(`skills.${skill}`) || skill}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── ROADMAP ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Career Roadmap</Text>
        <Text style={styles.sectionSubtitle}>
          {roadmap?.length || 0} steps · ~{totalWeeks} weeks total
        </Text>

        {(roadmap || []).map((item, i) => {
          const phaseColors =
            PHASE_COLORS[item.phase] || PHASE_COLORS.Foundation;

          return (
            <View
              key={i}
              style={[
                styles.roadmapCard,
                { backgroundColor: phaseColors.bg, borderColor: phaseColors.badge },
              ]}
            >
              {/* Timeline connector */}
              {i < roadmap.length - 1 && <View style={styles.connector} />}

              <View style={styles.roadmapHeader}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNumber}>{item.step}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.roadmapTitleRow}>
                    <Text style={styles.roadmapTitle}>
                      {t("build") || "Build"} {t(`skills.${item.skill}`) || item.skill} {t("proficiency") || "Proficiency"}
                    </Text>
                    {item.priority === "high" && (
                      <View style={styles.priorityBadge}>
                        <Text style={styles.priorityBadgeText}>{t("critical") || "Critical"}</Text>
                      </View>
                    )}
                  </View>
                  <PhaseChip phase={item.phase} t={t} />
                </View>
              </View>

              <Text style={styles.roadmapDescription}>
                {item.priority === "high" 
                  ? t("learningPathDescHigh") || "Required by your top matched job — closing this gap directly improves your match score."
                  : t("learningPathDescMedium") || "Present across multiple matched roles — adding this skill broadens your opportunities."}
              </Text>

              <View style={styles.roadmapMeta}>
                <Text style={styles.roadmapMetaText}>
                  ⏱  {item.estimatedWeeks} week{item.estimatedWeeks !== 1 ? "s" : ""}
                </Text>
                <Text style={styles.roadmapMetaText}>
                  Total by end: {item.cumulativeWeeks}w
                </Text>
              </View>

            </View>
          );
        })}
      </View>

      {/* ── SALARY PROJECTION ── */}
      <View style={styles.salaryCard}>
        <Text style={styles.salaryTitle}>💰  Salary Projection (INR)</Text>
        <View style={styles.salaryRow}>
          <View style={styles.salaryItem}>
            <Text style={styles.salaryValue}>
              ₹{fmt(Math.round((salary?.currentEstimate || 0) / 100000))}L
            </Text>
            <Text style={styles.salaryLabel}>Current Est.</Text>
          </View>
          <Text style={styles.salaryArrow}>→</Text>
          <View style={styles.salaryItem}>
            <Text style={[styles.salaryValue, { color: "#16A34A" }]}>
              ₹{fmt(Math.round((salary?.projectedEstimate || 0) / 100000))}L
            </Text>
            <Text style={styles.salaryLabel}>After Path</Text>
          </View>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    padding: 20,
    paddingBottom: 48,
    backgroundColor: "#F9FAFB",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  loadingLabel: {
    marginTop: 16,
    color: "#6B7280",
    fontSize: 15,
  },

  emptyText: {
    color: "#6B7280",
    fontSize: 16,
  },

  /* ── Header ── */
  headerBlock: {
    marginBottom: 24,
    paddingTop: 8,
  },
  headerLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E85D04",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerRole: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  headerTarget: {
    fontSize: 15,
    color: "#6B7280",
  },

  /* ── Section ── */
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 14,
  },

  /* ── Assessment ── */
  assessmentRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  assessmentItem: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  assessmentValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  assessmentLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },

  topJobCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  topJobLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#E85D04",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  topJobTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  topJobMeta: {
    fontSize: 13,
    color: "#6B7280",
  },

  /* ── Projection card ── */
  projectionCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 22,
    marginBottom: 28,
  },
  projectionTitle: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 18,
  },
  projectionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  projectionItem: {
    flex: 1,
    alignItems: "center",
  },
  projectionValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  projectionItemLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  projectionDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#374151",
    marginHorizontal: 8,
  },

  /* Bar */
  barLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  barLabelText: { fontSize: 12, color: "#9CA3AF" },
  barTrack: {
    height: 6,
    backgroundColor: "#374151",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },

  /* ── Gap chips ── */
  gapChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gapChip: {
    backgroundColor: "#FEF2F2",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  gapChipText: {
    color: "#DC2626",
    fontWeight: "600",
    fontSize: 13,
  },

  /* ── Roadmap ── */
  roadmapCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    position: "relative",
    overflow: "visible",
  },
  connector: {
    position: "absolute",
    left: 30,
    bottom: -14,
    width: 2,
    height: 14,
    backgroundColor: "#E5E7EB",
    zIndex: 1,
  },
  roadmapHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepNumber: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  roadmapTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 6,
  },
  roadmapTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    flexShrink: 1,
  },
  priorityBadge: {
    backgroundColor: "#DC2626",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  priorityBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  phaseChip: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  phaseChipText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  roadmapDescription: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 21,
    marginBottom: 12,
  },
  roadmapMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roadmapMetaText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
  },

  /* ── Salary ── */
  salaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  salaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  salaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  salaryItem: { alignItems: "center" },
  salaryValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  salaryLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  salaryArrow: {
    fontSize: 22,
    color: "#9CA3AF",
    fontWeight: "bold",
  },
});