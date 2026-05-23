import { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import API from "../../services/api";
import { auth } from "../../services/firebase";
import { useI18n } from "../../context/I18nContext";
import { COLORS, BORDER_RADIUS, SHADOWS } from "../../constants/theme";

const PRIORITY_STYLES = {
  high: { label: "HIGH", bg: "#FCE7F3", text: "#9D174D" },
  medium: { label: "MEDIUM", bg: "#FFEDD5", text: "#C2410C" },
  low: { label: "LOW", bg: "#F3F4F6", text: "#4B5563" },
};

function getPriorityStyle(priority, index) {
  if (priority === "high") return PRIORITY_STYLES.high;
  if (priority === "medium") return PRIORITY_STYLES.medium;
  if (index === 0) return PRIORITY_STYLES.high;
  if (index === 1) return PRIORITY_STYLES.medium;
  return PRIORITY_STYLES.low;
}

export default function LearningPathScreen({ route }) {
  const navigation = useNavigation();
  const { matchContext } = route?.params || {};
  const { t, language } = useI18n();

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    fetchPlan();
  }, []);

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
        <ActivityIndicator size="large" color={COLORS.accent} />
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

  const boostPerGap = skillGaps?.length
    ? Math.round(matchImprovementDelta / skillGaps.length)
    : 5;

  const getRoadmapStatus = (index) => {
    if (index < 2) return "completed";
    if (index === 2) return "current";
    return "upcoming";
  };

  const formatCourseMeta = (item) => {
    const weeks = item.estimatedWeeks || 1;
    const hours = weeks * 4;
    if (hours >= 4) return `Course · ${hours} hrs`;
    return `Video · ${weeks * 45} min`;
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back-outline" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Learning Path</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.roadmapBanner}>
          <Text style={styles.roadmapBannerIcon}>🤖</Text>
          <View style={styles.roadmapBannerText}>
            <Text style={styles.roadmapBannerTitle}>Personalised roadmap</Text>
            <Text style={styles.roadmapBannerSub}>
              Complete these to boost your match score by +{matchImprovementDelta}%
            </Text>
          </View>
        </View>

        <View style={styles.assessmentCard}>
          <Text style={styles.assessmentRole}>{t(`roles.${role}`) || role}</Text>
          <Text style={styles.assessmentTarget}>↗ Target: {t(`roles.${targetRole}`) || targetRole}</Text>
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
            <Text style={styles.topJobMeta}>
              🏆 {topJob.title} · {topJob.matchScore}% match
            </Text>
          )}
        </View>

        <View style={styles.projectionCard}>
          <Text style={styles.projectionTitle}>After completing this path</Text>
          <View style={styles.projectionRow}>
            <Text style={styles.projectionValue}>+{matchImprovementDelta}%</Text>
            <Text style={styles.projectionDivider}>·</Text>
            <Text style={styles.projectionValue}>~{totalWeeks}w</Text>
            <Text style={styles.projectionDivider}>·</Text>
            <Text style={styles.projectionValue}>{projectedMatchScore}%</Text>
          </View>
          <Text style={styles.projectionSub}>
            Projected match · {currentMatchScore}% → {projectedMatchScore}%
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Skill Gaps</Text>
        {(skillGaps || []).map((skill, i) => {
          const pStyle = getPriorityStyle(
            roadmap?.[i]?.priority,
            i
          );
          const boost = boostPerGap + (skillGaps.length - i - 1);
          return (
            <View key={i} style={styles.gapCard}>
              <View style={styles.gapCardLeft}>
                <Text style={styles.gapSkillName}>{t(`skills.${skill}`) || skill}</Text>
                <View style={[styles.priorityPill, { backgroundColor: pStyle.bg }]}>
                  <Text style={[styles.priorityPillText, { color: pStyle.text }]}>
                    {pStyle.label}
                  </Text>
                </View>
              </View>
              <Text style={styles.gapBoost}>+{boost}%</Text>
            </View>
          );
        })}

        <Text style={styles.sectionTitle}>🗺️ Your Learning Roadmap</Text>

        <View style={styles.timeline}>
          {(roadmap || []).map((item, i) => {
            const status = getRoadmapStatus(i);
            const isLast = i === roadmap.length - 1;

            return (
              <View key={i} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  {status === "completed" && (
                    <View style={[styles.timelineNode, styles.nodeCompleted]}>
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    </View>
                  )}
                  {status === "current" && (
                    <View style={[styles.timelineNode, styles.nodeCurrent]}>
                      <Text style={styles.nodeNumber}>{item.step}</Text>
                    </View>
                  )}
                  {status === "upcoming" && (
                    <View style={[styles.timelineNode, styles.nodeUpcoming]}>
                      <Text style={styles.nodeNumberUpcoming}>{item.step}</Text>
                    </View>
                  )}
                  {!isLast && (
                    <View
                      style={[
                        styles.timelineLine,
                        status === "completed" ? styles.lineCompleted : styles.lineDefault,
                      ]}
                    />
                  )}
                </View>

                <View
                  style={[
                    styles.roadmapItemCard,
                    status === "current" && styles.roadmapItemCardActive,
                  ]}
                >
                  {status === "current" && (
                    <View style={styles.nowBadge}>
                      <Text style={styles.nowBadgeText}>NOW</Text>
                    </View>
                  )}
                  <Text style={styles.roadmapItemTitle}>
                    {item.title || `${t(`skills.${item.skill}`) || item.skill} Fundamentals`}
                  </Text>
                  <Text style={styles.roadmapItemMeta}>{formatCourseMeta(item)}</Text>
                  <Text style={styles.roadmapItemDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.salaryCard}>
          <Text style={styles.salaryTitle}>💰  Salary Projection (INR)</Text>
          <View style={styles.salaryRow}>
            <View style={styles.salaryItem}>
              <Text style={styles.salaryValue}>
                ₹{Math.round((plan.salary?.currentEstimate || 0) / 100000)}L
              </Text>
              <Text style={styles.salaryLabel}>Current Est.</Text>
            </View>
            <Text style={styles.salaryArrow}>→</Text>
            <View style={styles.salaryItem}>
              <Text style={[styles.salaryValue, { color: COLORS.success }]}>
                ₹{Math.round((plan.salary?.projectedEstimate || 0) / 100000)}L
              </Text>
              <Text style={styles.salaryLabel}>After Path</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
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
  container: {
    padding: 20,
    paddingBottom: 48,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: COLORS.background,
  },
  loadingLabel: {
    marginTop: 16,
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  roadmapBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginBottom: 24,
    gap: 12,
  },
  roadmapBannerIcon: { fontSize: 20 },
  roadmapBannerText: { flex: 1 },
  roadmapBannerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 4,
  },
  roadmapBannerSub: {
    fontSize: 14,
    color: "#3B82F6",
    lineHeight: 20,
  },
  assessmentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  assessmentRole: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  assessmentTarget: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  assessmentRow: {
    flexDirection: "row",
    gap: 8,
  },
  assessmentItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
  },
  assessmentValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  assessmentLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  topJobMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  projectionCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    marginBottom: 24,
  },
  projectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  projectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  projectionValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  projectionDivider: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 18,
  },
  projectionSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 14,
  },
  gapCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  gapCardLeft: { flex: 1 },
  gapSkillName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  priorityPill: {
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  priorityPillText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  gapBoost: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.success,
  },
  timeline: { marginBottom: 24 },
  timelineRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  timelineLeft: {
    width: 36,
    alignItems: "center",
    marginRight: 12,
  },
  timelineNode: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  nodeCompleted: { backgroundColor: COLORS.success },
  nodeCurrent: { backgroundColor: COLORS.primaryDark },
  nodeUpcoming: { backgroundColor: "#D1D5DB" },
  nodeNumber: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  nodeNumberUpcoming: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 40,
    marginTop: 4,
  },
  lineCompleted: { backgroundColor: COLORS.success },
  lineDefault: { backgroundColor: "#E5E7EB" },
  roadmapItemCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: "relative",
  },
  roadmapItemCardActive: {
    borderColor: COLORS.primaryDark,
    borderWidth: 2,
  },
  nowBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  nowBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
  },
  roadmapItemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
    paddingRight: 48,
  },
  roadmapItemMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  roadmapItemDesc: {
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 17,
  },
  salaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  salaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
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
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  salaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  salaryArrow: {
    fontSize: 22,
    color: COLORS.textLight,
    fontWeight: "bold",
  },
});
