import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "../constants/theme";

export default function AppCard({ children, style, variant = "elevated" }) {
  return (
    <View style={[
      styles.card, 
      variant === "elevated" ? styles.elevated : styles.outlined,
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginVertical: SPACING.sm,
  },
  elevated: {
    ...SHADOWS.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
