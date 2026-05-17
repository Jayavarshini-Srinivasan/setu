import React from "react";
import { View, StyleSheet, Animated } from "react-native";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/theme";

export default function ProgressIndicator({ steps, currentStep }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: steps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.segment,
            index < currentStep ? styles.segmentActive : styles.segmentInactive,
            index === currentStep && styles.segmentCurrent,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.md,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: BORDER_RADIUS.round,
    marginHorizontal: 2,
  },
  segmentActive: {
    backgroundColor: COLORS.primary,
  },
  segmentCurrent: {
    backgroundColor: COLORS.primaryLight,
  },
  segmentInactive: {
    backgroundColor: COLORS.border,
  },
});
