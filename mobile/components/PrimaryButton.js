import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS } from "../constants/theme";

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
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
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
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    width: "100%",
  },
  disabled: {
    backgroundColor: COLORS.border,
  },
  text: {
    fontFamily: "DM Sans",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.01 * 15,
    color: "#FFFFFF",
  },
  textDisabled: {
    color: COLORS.textMuted,
  },
});