import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../constants/theme";

export default function StatusBadge({ status, text }) {
  const getColors = () => {
    switch (status) {
      case "success":
        return { bg: COLORS.success + "20", text: COLORS.success };
      case "warning":
        return { bg: COLORS.warning + "20", text: COLORS.warning };
      case "error":
        return { bg: COLORS.error + "20", text: COLORS.error };
      case "info":
      default:
        return { bg: COLORS.primaryLight + "20", text: COLORS.primaryDark };
    }
  };

  const { bg, text: textColor } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: "flex-start",
  },
  text: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: "600",
    textTransform: "uppercase",
    fontSize: 12,
  },
});
