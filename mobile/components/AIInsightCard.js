import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function AIInsightCard({ title, insight, style }) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={20} color={COLORS.primary} style={styles.icon} />
        <Text style={styles.title}>{title || "AI Insight"}</Text>
      </View>
      <Text style={styles.insightText}>{insight}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.primaryLight + "15", // Very light primary tint
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryLight + "40",
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.label,
    color: COLORS.primaryDark,
  },
  insightText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    lineHeight: 22,
  },
});
