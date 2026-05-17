import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../constants/theme";

export default function SecondaryButton({
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
        <ActivityIndicator color={COLORS.primary} size="small" />
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
    backgroundColor: "transparent",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  disabled: {
    borderColor: COLORS.border,
  },
  text: {
    ...TYPOGRAPHY.button,
    color: COLORS.primary,
  },
  textDisabled: {
    color: COLORS.textMuted,
  },
});
