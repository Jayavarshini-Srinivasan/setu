import { useEffect, useState, useCallback, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

function getProgressCacheKey(userId, role) {
  const safeRole = (role || "unknown").replace(/\s+/g, "_").toLowerCase();
  return `learningPath_progress_${userId}_${safeRole}`;
}

export default function LearningPathScreen({ route }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { matchContext } = route?.params || {};
  const { t, language } = useI18n();

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  // completedSteps: Set of step indices (0-based)
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const modalShownRef = useRef(false);
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    fetchPlan();
  }, []);

  // Load persisted progress once plan is loaded
  useEffect(() => {
    if (!plan || !userId) return;
    loadProgress(plan);
  }, [plan, userId]);

  const fetchPlan = async () => {
    try {
      if (!userId) throw new Error("Not authenticated");

      const response = await API.post("/learning/path", {
        userId,
        matchContext: matchContext || {},
        language,
      });

      setPlan(response.data);
    } catch (err) {
      console.error("[LearningPathScreen]", err);
      Alert.alert(
        t("error") || "Error",
        t("couldNotGeneratePath") || "Could not generate your career path. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async (currentPlan) => {
    try {
      const role = currentPlan?.role || "";
      const key = getProgressCacheKey(userId, role);
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const indices = JSON.parse(stored);
        if (Array.isArray(indices)) {
          setCompletedSteps(new Set(indices));
        }
      }
    } catch (err) {
      console.warn("[LearningPath] loadProgress error:", err);
    }
  };

  const saveProgress = async (newSet, role) => {
    try {
      const key = getProgressCacheKey(userId, role || "");
      await AsyncStorage.setItem(key, JSON.stringify([...newSet]));
    } catch (err) {
      console.warn("[LearningPath] saveProgress error:", err);
    }
  };

  const handleMarkDone = useCallback(
    async (index) => {
      if (!plan) return;
      const roadmap = Array.isArray(plan.roadmap) ? plan.roadmap : [];
      const newSet = new Set(completedSteps);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      setCompletedSteps(newSet);
      await saveProgress(newSet, plan.role);

      // Show completion modal only once when all steps are done
      if (newSet.size === roadmap.length && roadmap.length > 0 && !modalShownRef.current) {
        modalShownRef.current = true;
        setShowCompletionModal(true);
        // Animate modal in
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 80,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }

      // If a step is unmarked and modal was shown before, reset so it can trigger again
      if (newSet.size < roadmap.length) {
        modalShownRef.current = false;
      }
    },
    [completedSteps, plan, scaleAnim, opacityAnim]
  );

  const handleCloseModal = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.7,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowCompletionModal(false);
      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0);
    });
  };

  const getStepStatus = (index) => {
    if (completedSteps.has(index)) return "completed";
    // Find the first non-completed step — that is "current"
    const roadmap = plan?.roadmap || [];
    for (let i = 0; i < roadmap.length; i++) {
      if (!completedSteps.has(i)) {
        if (i === index) return "current";
        break;
      }
    }
    return "upcoming";
  };

  const formatCourseMeta = (item) => {
    const weeks = item.estimatedWeeks || 1;
    const hours = weeks * 4;
    if (hours >= 4) return `Course · ${hours} hrs`;
    return `Video · ${weeks * 45} min`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingLabel}>{t("buildingRoadmap") || "Building your career roadmap…"}</Text>
      </View>
    );
  }

  if (!plan || plan.error || !Array.isArray(plan.roadmap)) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>
          {plan?.error || t("noCareerPathData") || "No career path data available."}
        </Text>
      </View>
    );
  }

  const {
    role,
    targetRole,
    currentAssessment,
    totalWeeks,
    currentMatchScore,
    projectedMatchScore,
    matchImprovementDelta,
    topJob,
  } = plan;

  const skillGaps = Array.isArray(plan.skillGaps) ? plan.skillGaps : [];
  const roadmap = Array.isArray(plan.roadmap) ? plan.roadmap : [];
  const scoreDelta = Number(matchImprovementDelta || 0);
  const weeksTotal = Number(
    totalWeeks ||
      roadmap.reduce((sum, item) => sum + Number(item.estimatedWeeks || 1), 0)
  );
  const currentScore = Number(currentMatchScore || 0);
  const projectedScore = Number(projectedMatchScore || currentScore + scoreDelta);
  const boostPerGap = skillGaps.length ? Math.round(scoreDelta / skillGaps.length) : 5;

  const completedCount = completedSteps.size;
  const totalSteps = roadmap.length;
  const allCompleted = totalSteps > 0 && completedCount === totalSteps;
  const progressPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <View style={styles.root}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back-outline" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Learning Path</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 48 }]}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        {/* BANNER: Completion vs Personalised Roadmap */}
        {allCompleted ? (
          <View style={styles.completionBanner}>
            <View style={styles.completionBannerIcon}>
              <Ionicons name="trophy-outline" size={22} color="#D97706" />
            </View>
            <View style={styles.completionBannerText}>
              <Text style={styles.completionBannerTitle}>Path Completed! 🎉</Text>
              <Text style={styles.completionBannerSub}>
                You've completed all {totalSteps} steps. Your match score is projected to reach {projectedScore}%.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.roadmapBanner}>
            <View style={styles.roadmapBannerIcon}>
              <Ionicons name="sparkles-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.roadmapBannerText}>
              <Text style={styles.roadmapBannerTitle}>Personalised roadmap</Text>
              <Text style={styles.roadmapBannerSub}>
                Complete these to boost your match score by +{scoreDelta}%
              </Text>
            </View>
          </View>
        )}

        {/* PROGRESS BAR */}
        {totalSteps > 0 && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeaderRow}>
              <Text style={styles.progressCardTitle}>Your Progress</Text>
              <Text style={styles.progressCardValue}>{completedCount}/{totalSteps} steps</Text>
            </View>
            <View style={styles.progressTrackBar}>
              <View style={[styles.progressFillBar, { width: `${progressPct}%` }]} />
            </View>
            <Text style={styles.progressPct}>{progressPct}% complete</Text>
          </View>
        )}

        {/* ASSESSMENT CARD */}
        <View style={styles.assessmentCard}>
          <Text style={styles.assessmentRole} numberOfLines={2}>
            {t(`roles.${role}`) || role || "Current role"}
          </Text>
          <View style={styles.targetRow}>
            <Ionicons name="trending-up-outline" size={15} color={COLORS.textSecondary} />
            <Text style={styles.assessmentTarget} numberOfLines={2}>
              Target: {t(`roles.${targetRole}`) || targetRole || "Next role"}
            </Text>
          </View>
          <View style={styles.assessmentRow}>
            <View style={styles.assessmentItem}>
              <Text style={styles.assessmentValue}>{currentScore}%</Text>
              <Text style={styles.assessmentLabel}>Best Match</Text>
            </View>
            <View style={styles.assessmentItem}>
              <Text style={styles.assessmentValue}>{currentAssessment?.skillCount || 0}</Text>
              <Text style={styles.assessmentLabel}>Skills</Text>
            </View>
            <View style={styles.assessmentItem}>
              <Text style={styles.assessmentValue}>{skillGaps.length}</Text>
              <Text style={styles.assessmentLabel}>Skill Gaps</Text>
            </View>
          </View>
          {topJob && (
            <Text style={styles.topJobMeta} numberOfLines={2}>
              Top match: {topJob.title} — {topJob.matchScore}% match
            </Text>
          )}
        </View>

        {/* PROJECTION CARD */}
        <View style={styles.projectionCard}>
          <Text style={styles.projectionTitle}>After completing this path</Text>
          <View style={styles.projectionRow}>
            <View style={styles.projectionMetric}>
              <Text style={styles.projectionValue}>+{scoreDelta}%</Text>
              <Text style={styles.projectionMetricLabel}>Boost</Text>
            </View>
            <View style={styles.projectionMetric}>
              <Text style={styles.projectionValue}>~{weeksTotal}w</Text>
              <Text style={styles.projectionMetricLabel}>Timeline</Text>
            </View>
            <View style={styles.projectionMetric}>
              <Text style={styles.projectionValue}>{projectedScore}%</Text>
              <Text style={styles.projectionMetricLabel}>Projected</Text>
            </View>
          </View>
          <Text style={styles.projectionSub}>
            Projected match: {currentScore}% → {projectedScore}%
          </Text>
        </View>

        {/* SKILL GAPS */}
        {skillGaps.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Skill Gaps</Text>
            {skillGaps.map((skill, i) => {
              const pStyle = getPriorityStyle(roadmap?.[i]?.priority, i);
              const boost = boostPerGap + (skillGaps.length - i - 1);
              return (
                <View key={i} style={styles.gapCard}>
                  <View style={styles.gapCardLeft}>
                    <Text style={styles.gapSkillName} numberOfLines={2}>
                      {t(`skills.${skill}`) || skill}
                    </Text>
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
          </>
        )}

        {/* ROADMAP TIMELINE */}
        {roadmap.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Your Learning Roadmap</Text>
            <View style={styles.timeline}>
              {roadmap.map((item, i) => {
                const status = getStepStatus(i);
                const isLast = i === roadmap.length - 1;
                const stepNumber = item.step || i + 1;
                const isDone = completedSteps.has(i);

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
                          <Text style={styles.nodeNumber}>{stepNumber}</Text>
                        </View>
                      )}
                      {status === "upcoming" && (
                        <View style={[styles.timelineNode, styles.nodeUpcoming]}>
                          <Text style={styles.nodeNumberUpcoming}>{stepNumber}</Text>
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
                        isDone && styles.roadmapItemCardDone,
                      ]}
                    >
                      {status === "current" && !isDone && (
                        <View style={styles.nowBadge}>
                          <Text style={styles.nowBadgeText}>NOW</Text>
                        </View>
                      )}
                      {isDone && (
                        <View style={styles.doneBadge}>
                          <Ionicons name="checkmark-circle" size={14} color="#059669" style={{ marginRight: 4 }} />
                          <Text style={styles.doneBadgeText}>Done</Text>
                        </View>
                      )}
                      <Text style={styles.roadmapItemTitle} numberOfLines={2}>
                        {item.title || `${t(`skills.${item.skill}`) || item.skill} Fundamentals`}
                      </Text>
                      <Text style={styles.roadmapItemMeta}>{formatCourseMeta(item)}</Text>
                      <Text style={styles.roadmapItemDesc} numberOfLines={3}>
                        {item.description || "Focused practice to close this skill gap and improve job readiness."}
                      </Text>

                      {/* MARK AS DONE BUTTON */}
                      <TouchableOpacity
                        style={[styles.markDoneBtn, isDone && styles.markDoneBtnActive]}
                        onPress={() => handleMarkDone(i)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={isDone ? "checkmark-circle" : "checkmark-circle-outline"}
                          size={16}
                          color={isDone ? "#FFFFFF" : COLORS.primary}
                          style={{ marginRight: 6 }}
                        />
                        <Text style={[styles.markDoneBtnText, isDone && styles.markDoneBtnTextActive]}>
                          {isDone ? "Completed ✓" : "Mark as Done"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* SALARY PROJECTION */}
        {(plan.salary?.currentEstimate > 0 || plan.salary?.projectedEstimate > 0) && (
          <View style={styles.salaryCard}>
            <Text style={styles.salaryTitle}>Salary Projection (INR)</Text>
            <View style={styles.salaryRow}>
              <View style={styles.salaryItem}>
                <Text style={styles.salaryValue}>
                  ₹{Math.round((plan.salary?.currentEstimate || 0) / 100000)}L
                </Text>
                <Text style={styles.salaryLabel}>Current Est.</Text>
              </View>
              <Ionicons name="arrow-forward-outline" size={22} color={COLORS.textLight} />
              <View style={styles.salaryItem}>
                <Text style={[styles.salaryValue, { color: COLORS.success }]}>
                  ₹{Math.round((plan.salary?.projectedEstimate || 0) / 100000)}L
                </Text>
                <Text style={styles.salaryLabel}>After Path</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* COMPLETION MODAL */}
      <Modal
        visible={showCompletionModal}
        transparent
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalCard,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={styles.modalTitle}>Hurray!</Text>
            <Text style={styles.modalSubtitle}>You completed this learning path</Text>
            <Text style={styles.modalBody}>
              Amazing work! You've finished all {totalSteps} steps.{"\n"}
              Your projected match score is now{" "}
              <Text style={styles.modalHighlight}>{projectedScore}%</Text>.
            </Text>
            <View style={styles.modalStars}>
              <Text style={styles.modalStarText}>⭐ ⭐ ⭐ ⭐ ⭐</Text>
            </View>
            <TouchableOpacity style={styles.modalButton} onPress={handleCloseModal} activeOpacity={0.85}>
              <Text style={styles.modalButtonText}>Awesome! 🚀</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
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
    minWidth: 0,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  headerSpacer: { width: 40 },
  container: {
    padding: 20,
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

  /* ── Banners ── */
  roadmapBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginBottom: 16,
    gap: 12,
  },
  roadmapBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  roadmapBannerText: { flex: 1, minWidth: 0 },
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
  completionBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFBEB",
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#FCD34D",
    marginBottom: 16,
    gap: 12,
  },
  completionBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
  },
  completionBannerText: { flex: 1, minWidth: 0 },
  completionBannerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 4,
  },
  completionBannerSub: {
    fontSize: 13,
    color: "#B45309",
    lineHeight: 19,
  },

  /* ── Progress Card ── */
  progressCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  progressHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  progressCardValue: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },
  progressTrackBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFillBar: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressPct: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "right",
  },

  /* ── Assessment ── */
  assessmentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  assessmentRole: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 24,
  },
  targetRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 14,
  },
  assessmentTarget: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  assessmentRow: {
    flexDirection: "row",
    gap: 8,
  },
  assessmentItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
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
    textAlign: "center",
  },
  topJobMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 12,
  },

  /* ── Projection ── */
  projectionCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    marginBottom: 24,
    ...SHADOWS.card,
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
    justifyContent: "space-between",
    gap: 10,
  },
  projectionMetric: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  projectionValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  projectionMetricLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.58)",
    marginTop: 4,
  },
  projectionSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    marginTop: 10,
  },

  /* ── Section Title ── */
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 14,
  },

  /* ── Skill Gaps ── */
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
  gapCardLeft: { flex: 1, minWidth: 0, paddingRight: 12 },
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
    flexShrink: 0,
  },

  /* ── Timeline ── */
  timeline: { marginBottom: 24 },
  timelineRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 4,
  },
  timelineLeft: {
    width: 36,
    alignItems: "center",
    marginRight: 12,
    flexShrink: 0,
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

  /* ── Roadmap Item Cards ── */
  roadmapItemCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: "relative",
    ...SHADOWS.sm,
  },
  roadmapItemCardActive: {
    borderColor: COLORS.primaryDark,
    borderWidth: 2,
  },
  roadmapItemCardDone: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
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
  doneBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  doneBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  roadmapItemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
    paddingRight: 60,
    lineHeight: 20,
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
    marginBottom: 12,
  },

  /* ── Mark as Done Button ── */
  markDoneBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
    backgroundColor: COLORS.primaryLight,
  },
  markDoneBtnActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  markDoneBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },
  markDoneBtnTextActive: {
    color: "#FFFFFF",
  },

  /* ── Salary Card ── */
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
    justifyContent: "space-between",
    gap: 10,
  },
  salaryItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  salaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
    textAlign: "center",
  },
  salaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  /* ── Completion Modal ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 360,
    ...SHADOWS.card,
  },
  modalEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 16,
    textAlign: "center",
  },
  modalBody: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  modalHighlight: {
    fontWeight: "700",
    color: COLORS.primary,
  },
  modalStars: {
    marginBottom: 24,
  },
  modalStarText: {
    fontSize: 22,
    letterSpacing: 4,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: "100%",
    alignItems: "center",
    ...SHADOWS.card,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
