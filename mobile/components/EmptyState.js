import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY } from "../constants/theme";
import PrimaryButton from "./PrimaryButton";
import { Ionicons } from "@expo/vector-icons";

export default function EmptyState({ icon = "document-text-outline", title, message, actionLabel, onAction }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={64} color={COLORS.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <PrimaryButton
          title={actionLabel}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  iconContainer: {
    marginBottom: SPACING.lg,
    padding: SPACING.xl,
    backgroundColor: COLORS.border,
    borderRadius: 100,
  },
  title: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  message: {
    ...TYPOGRAPHY.body,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  button: {
    minWidth: 200,
  },
});