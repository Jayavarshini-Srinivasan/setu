import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../constants/theme";

export default function SkillChip({ skill, selected, onPress, removable, onRemove }) {
  const ChipWrapper = onPress ? TouchableOpacity : View;

  return (
    <ChipWrapper
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>
        {skill}
      </Text>
      {removable && (
        <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
          <Text style={styles.removeText}>✕</Text>
        </TouchableOpacity>
      )}
    </ChipWrapper>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primaryLight + "20", // 20% opacity
    borderColor: COLORS.primary,
  },
  text: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
  },
  textSelected: {
    color: COLORS.primaryDark,
    fontWeight: "600",
  },
  removeBtn: {
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.round,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: "bold",
  },
});
