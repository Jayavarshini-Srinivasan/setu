import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { formatSalary } from "../utils/formatters";
import PrimaryButton from "./PrimaryButton";
import { useI18n } from "../context/I18nContext";



const RECOMMENDATION_LABELS = {
  best_pick:   { labelKey: "bestPick", color: "#16A34A", bg: "#F0FDF4" },
  good_fit:    { labelKey: "goodFit", color: "#E85D26", bg: "#EFF6FF" },
  average_fit: { labelKey: "averageFit", color: "#6B6B80", bg: "#F7F5F2" },
};

function scoreColor(score) {
  if (score >= 75) return "#16A34A";
  if (score >= 50) return "#D97706";
  return "#DC2626";
}

export default function JobCard({ job, onApply }) {
  const { t } = useI18n();

  const rec     = RECOMMENDATION_LABELS[job.recommendationType] || RECOMMENDATION_LABELS.average_fit;
  const isBest  = job.recommendationType === "best_pick";
  const pros    = Array.isArray(job.pros) ? job.pros : [];
  const cons    = Array.isArray(job.cons) ? job.cons : [];
  const missing = Array.isArray(job.missingSkills) ? job.missingSkills : [];

  return (
    <View style={[styles.card, isBest && styles.cardBestPick]}>

      {isBest && (
        <View style={styles.bestBanner}>
          <Text style={styles.bestBannerText}>🏆  {t("bestPickForYou") || "Best Pick for You"}</Text>
        </View>
      )}

      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.meta}>📍 {job.location}</Text>
          <Text style={styles.meta}>💰 {formatSalary(job.salary)}</Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: scoreColor(job.matchScore) }]}>
          <Text style={styles.scoreValue}>{job.matchScore}%</Text>
          <Text style={styles.scoreLabel}>{t("match") || "Match"}</Text>
        </View>
      </View>

      <View style={[styles.recChip, { backgroundColor: rec.bg }]}>
        <Text style={[styles.recChipText, { color: rec.color }]}>{t(rec.labelKey) || rec.labelKey}</Text>
      </View>

      {job.aiSummary ? (
        <Text style={styles.summary}>{job.aiSummary}</Text>
      ) : null}

      {(pros.length > 0 || cons.length > 0) && (
        <View style={styles.prosConsRow}>

          {pros.length > 0 && (
            <View style={styles.prosBox}>
              <Text style={styles.prosTitle}>✓  {t("strengths") || "Strengths"}</Text>
              {pros.map((p, i) => (
                <Text key={i} style={styles.proItem}>• {p}</Text>
              ))}
            </View>
          )}

          {cons.length > 0 && (
            <View style={styles.consBox}>
              <Text style={styles.consTitle}>✗  {t("gaps") || "Gaps"}</Text>
              {cons.map((c, i) => (
                <Text key={i} style={styles.conItem}>• {c}</Text>
              ))}
            </View>
          )}

        </View>
      )}

      {job.metrics?.skillMatch !== undefined && (
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>{t("skillMatch") || "Skill match"}</Text>
          <View style={styles.metricBarTrack}>
            <View
              style={[
                styles.metricBarFill,
                {
                  width: `${job.metrics.skillMatch}%`,
                  backgroundColor: scoreColor(job.metrics.skillMatch),
                },
              ]}
            />
          </View>
          <Text style={[styles.metricPct, { color: scoreColor(job.metrics.skillMatch) }]}>
            {job.metrics.skillMatch}%
          </Text>
        </View>
      )}

      {missing.length > 0 && (
        <View style={styles.improvementSection}>
          <View style={styles.improvementHeader}>
            <Text style={styles.improvementTitle}>{t("skillsToBridge") || "Skills to bridge this gap"}</Text>
            {job.potentialMatchScore && (
              <Text style={styles.improvementScore}>
                {job.matchScore}% → {job.potentialMatchScore}%
              </Text>
            )}
          </View>

          <View style={styles.skillsContainer}>
            {missing.map((skill, i) => {
              const displaySkill = t(`skills.${skill}`);
              return (
                <View key={i} style={styles.skillChip}>
                  <Text style={styles.skillText}>{displaySkill || skill}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <PrimaryButton title={t("applyNow") || "Apply Now"} onPress={() => onApply(job)} />

    </View>
  );
}

const styles = StyleSheet.create({

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    elevation: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },

  cardBestPick: {
    borderColor: "#16A34A",
    borderWidth: 2,
  },

  bestBanner: {
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 14,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  bestBannerText: {
    color: "#15803D",
    fontWeight: "700",
    fontSize: 13,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A2E",
    marginBottom: 6,
  },
  meta: {
    color: "#6B6B80",
    fontSize: 13,
    marginBottom: 3,
  },

  scoreBadge: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    minWidth: 56,
  },
  scoreValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  scoreLabel: {
    color: "#FFFFFF",
    fontSize: 10,
    opacity: 0.85,
    marginTop: 1,
  },

  recChip: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  recChipText: {
    fontSize: 12,
    fontWeight: "700",
  },

  summary: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6B6B80",
    marginBottom: 14,
    fontStyle: "italic",
  },

  prosConsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  prosBox: {
    flex: 1,
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  consBox: {
    flex: 1,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  prosTitle: {
    color: "#15803D",
    fontWeight: "700",
    fontSize: 12,
    marginBottom: 6,
  },
  consTitle: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 12,
    marginBottom: 6,
  },
  proItem: {
    color: "#166534",
    fontSize: 12,
    lineHeight: 18,
  },
  conItem: {
    color: "#991B1B",
    fontSize: 12,
    lineHeight: 18,
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  metricLabel: {
    fontSize: 12,
    color: "#6B6B80",
    width: 70,
  },
  metricBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(26,26,46,0.12)",
    borderRadius: 3,
    overflow: "hidden",
  },
  metricBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  metricPct: {
    fontSize: 12,
    fontWeight: "700",
    width: 34,
    textAlign: "right",
  },

  improvementSection: {
    marginBottom: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  improvementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  improvementTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  improvementScore: {
    fontSize: 12,
    color: "#16A34A",
    fontWeight: "700",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillChip: {
    backgroundColor: "#EEF2FF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  skillText: {
    color: "#3730A3",
    fontWeight: "600",
    fontSize: 12,
  },
});