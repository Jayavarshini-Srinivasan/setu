import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from "../constants/theme";

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  style = {},
  textStyle = {},
}) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.surface} size="small" />
      ) : (
        <Text style={[styles.text, disabled && styles.textDisabled, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    ...SHADOWS.sm,
  },
  disabled: {
    backgroundColor: COLORS.border,
    ...SHADOWS.sm,
  },
  text: {
    ...TYPOGRAPHY.button,
    color: COLORS.surface,
  },
  textDisabled: {
    color: COLORS.textMuted,
  },
});