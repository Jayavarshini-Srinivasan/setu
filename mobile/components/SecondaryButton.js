import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS } from "../constants/theme";

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
      activeOpacity={0.85}
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
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    width: "100%",
  },
  disabled: {
    borderColor: COLORS.border,
  },
  text: {
    fontFamily: "DM Sans",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.01 * 15,
    color: COLORS.primary,
  },
  textDisabled: {
    color: COLORS.textMuted,
  },
});
