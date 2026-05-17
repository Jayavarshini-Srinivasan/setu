import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY } from "../constants/theme";

export default function LoadingState({ message = "Loading..." }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  text: {
    ...TYPOGRAPHY.body,
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
