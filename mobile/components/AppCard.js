import React from "react";
import { View, StyleSheet } from "react-native";
import { setuTokens } from "../constants/theme";

export default function AppCard({ children, style }) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: setuTokens.bgCard,
    borderWidth: 1,
    borderColor: setuTokens.border,
    borderRadius: setuTokens.radiusCard,
    padding: 16,
    elevation: 0,
    shadowOpacity: 0,
  },
});
