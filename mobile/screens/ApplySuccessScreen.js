import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useI18n } from "../context/I18nContext";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

function getTabsNavigatorName(navigation) {
  let nav = navigation;
  while (nav) {
    const state = nav.getState?.();
    if (state?.routeNames?.includes("ProfessionalTabs")) return "ProfessionalTabs";
    if (state?.routeNames?.includes("LabourTabs")) return "LabourTabs";
    const tabsRoute = state?.routes?.find(
      (r) => r.name === "LabourTabs" || r.name === "ProfessionalTabs"
    );
    if (tabsRoute?.name) return tabsRoute.name;
    nav = nav.getParent?.();
  }
  return "LabourTabs";
}

export default function ApplySuccessScreen({ route, navigation }) {
  const { t } = useI18n();
  const {
    jobTitle = "Job Role",
    company = "Company",
    jobId = "",
  } = route.params || {};

  const handleFindMoreJobs = () => {
    const tabsName = getTabsNavigatorName(navigation);
    navigation.navigate(tabsName, {
      screen: "Jobs",
      params: {
        justAppliedJobId: jobId ? String(jobId) : undefined,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back-outline" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <View style={styles.outerCircle}>
          <View style={styles.innerBox}>
            <Ionicons name="checkmark" size={36} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.title}>{t("applySuccess.title") || "Application Sent!"}</Text>

        <Text style={styles.subtitle}>
          {t("applySuccess.subtitle", { jobTitle, company }) ||
            `Your application for ${jobTitle} at ${company} has been submitted.`}
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderIcon}>📋</Text>
            <Text style={styles.cardTitle}>
              {t("applySuccess.whatHappensNext") || "What happens next"}
            </Text>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              {t("applySuccess.step1") || "Recruiter reviews your profile (1-3 days)"}
            </Text>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              {t("applySuccess.step2") || "You'll get shortlisted / interviewed"}
            </Text>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              {t("applySuccess.step3") || "Track status in 'Applied' tab"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleFindMoreJobs}
          activeOpacity={0.85}
        >
          <Ionicons
            name="search-sharp"
            size={18}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.ctaButtonText}>
            {t("applySuccess.findMoreJobs") || "Find More Jobs"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Ionicons
            name="arrow-back-sharp"
            size={18}
            color={COLORS.accent}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.secondaryButtonText}>
            {t("applySuccess.backToJobDetails") || "Back to Job Details"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  outerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E6F4EA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },
  innerBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 12,
    marginBottom: 32,
  },
  boldText: {
    fontWeight: "700",
    color: "#111827",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 20,
    width: "100%",
    marginBottom: 36,
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardHeaderIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  numberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFEFE6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  numberText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: "800",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  ctaButton: {
    backgroundColor: COLORS.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.md,
    width: "100%",
    ...SHADOWS.card,
  },
  ctaButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.md,
    width: "100%",
    marginTop: 12,
  },
  secondaryButtonText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: "700",
  },
});
