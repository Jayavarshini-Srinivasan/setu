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

export default function ApplySuccessScreen({ route, navigation }) {
  const { t } = useI18n();
  const { jobTitle = "Job Role", company = "Company" } = route.params || {};

  const handleFindMoreJobs = () => {
    // Navigates back to the main bottom tab 'Jobs'
    navigation.navigate("Jobs");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* LARGE CIRCULAR CHECK ICON */}
        <View style={styles.outerCircle}>
          <View style={styles.innerBox}>
            <Ionicons name="checkmark" size={36} color="#FFFFFF" />
          </View>
        </View>

        {/* TITLE */}
        <Text style={styles.title}>Application Sent!</Text>

        {/* SUBTITLE */}
        <Text style={styles.subtitle}>
          Your application for <Text style={styles.boldText}>{jobTitle}</Text> at{" "}
          <Text style={styles.boldText}>{company}</Text> has been submitted.
        </Text>

        {/* INFO CARD: WHAT HAPPENS NEXT */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderIcon}>📋</Text>
            <Text style={styles.cardTitle}>What happens next</Text>
          </View>

          {/* Step 1 */}
          <View style={styles.stepRow}>
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Recruiter reviews your profile (1-3 days)
            </Text>
          </View>

          {/* Step 2 */}
          <View style={styles.stepRow}>
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              You'll get shortlisted / interviewed
            </Text>
          </View>

          {/* Step 3 */}
          <View style={styles.stepRow}>
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Track status in 'Applied' tab
            </Text>
          </View>
        </View>

        {/* BUTTON: FIND MORE JOBS */}
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
          <Text style={styles.ctaButtonText}>Find More Jobs</Text>
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
    backgroundColor: "#10B981", // Success green
    justifyContent: "center",
    alignItems: "center",
    // Subtle shadow on check box
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
});
