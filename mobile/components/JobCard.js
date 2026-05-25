import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useI18n } from "../context/I18nContext";
import { COLORS, BORDER_RADIUS, SHADOWS } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

function scoreColor(score) {
  if (score >= 85) return COLORS.matchGreen;
  if (score >= 75) return COLORS.accent;
  return COLORS.textSecondary;
}

function scoreBg(score) {
  if (score >= 85) return COLORS.matchGreenBg;
  if (score >= 75) return COLORS.accentLight;
  return "#F3F4F6";
}

export default function JobCard({ job, onAnalyze, isApplied = false }) {
  const { t } = useI18n();

  const matched = Array.isArray(job.analysis?.matchedSkills) ? job.analysis.matchedSkills : [];
  const missing = Array.isArray(job.analysis?.missingSkills) ? job.analysis.missingSkills : [];

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

  const getDistanceText = () => {
    const jobKey = job.title || job.jobId || "";
    const distanceVal = job.distance || (((jobKey.charCodeAt(0) || 5) % 10) + 2.5).toFixed(1);
    return t("kmAway", { distance: distanceVal }) || `${distanceVal} km away`;
  };

  return (
    <View style={[styles.card, isApplied && styles.cardApplied]}>
      {isApplied && (
        <View style={styles.appliedBanner}>
          <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.appliedBadgeText}>
            {t("aiAnalysis.applied") || "Applied"}
          </Text>
        </View>
      )}
      <View style={styles.headerRow}>
        <View style={styles.infoCol}>
          <Text style={styles.title} numberOfLines={1}>{job.title}</Text>
          <Text style={styles.companyLocation} numberOfLines={1}>
            {job.company} • {job.location || "Koramangala"}
          </Text>
          <Text style={styles.salaryText}>{formatSalaryText(job.salary)}</Text>
        </View>

        <View style={styles.scoreCol}>
          <View
            style={[
              styles.scoreCircle,
              {
                borderColor: scoreColor(job.matchScore),
                backgroundColor: scoreBg(job.matchScore),
              },
            ]}
          >
            <Text style={[styles.scoreValue, { color: scoreColor(job.matchScore) }]}>
              {job.matchScore}%
            </Text>
          </View>
          <Text style={styles.matchLabel}>{t("matchLabel") || "match"}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {matched.length > 0 && (
        <View style={styles.skillSection}>
          <Text style={styles.skillLabel}>{t("youHave") || "You have:"}</Text>
          <View style={styles.skillRow}>
            {matched.slice(0, 3).map((skill, index) => (
              <View key={`matched-${index}`} style={styles.skillChipMatched}>
                <Text style={styles.skillTextMatched}>{t(`skills.${skill}`) || skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {missing.length > 0 && (
        <View style={styles.skillSection}>
          <Text style={styles.skillLabel}>{t("missingLabel") || "Missing:"}</Text>
          <View style={styles.skillRow}>
            {missing.slice(0, 3).map((skill, index) => (
              <View key={`missing-${index}`} style={styles.skillChipMissing}>
                <Text style={styles.skillTextMissing}>{t(`skills.${skill}`) || skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.bottomRow}>
        <View style={styles.distanceContainer}>
          <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
          <Text style={styles.distanceText}>{getDistanceText()}</Text>
        </View>

        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={() => onAnalyze && onAnalyze(job)}
          activeOpacity={0.8}
        >
          <Ionicons name="hardware-chip-outline" size={16} color={COLORS.accent} style={{ marginRight: 6 }} />
          <Text style={styles.analyzeButtonText}>{t("analyzeWithAI") || "Analyze with AI"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  cardApplied: {
    borderWidth: 2.5,
    borderColor: "#16A34A",
    backgroundColor: "#F0FDF4",
  },
  appliedBanner: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#16A34A",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  appliedBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoCol: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  companyLocation: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  salaryText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.accent,
  },
  scoreCol: {
    alignItems: "center",
  },
  scoreCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  matchLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  skillSection: {
    marginBottom: 10,
  },
  skillLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  skillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillChipMatched: {
    backgroundColor: COLORS.matchGreenBg,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  skillTextMatched: {
    color: COLORS.successText,
    fontSize: 12,
    fontWeight: "600",
  },
  skillChipMissing: {
    backgroundColor: "#F5F4F0",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skillTextMissing: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  distanceText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  analyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accentLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFEDD5",
  },
  analyzeButtonText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: "600",
  },
});
