import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";

import { useOnboarding } from "../context/OnboardingContext";
import { COLORS, BORDER_RADIUS, SHADOWS } from "../constants/theme";

export default function UserTypeSelectionScreen({ navigation }) {
  const { updateField } = useOnboarding();

  const handleLabour = () => {
    updateField("workerType", "labour");
    navigation.navigate("RoleQuestion");
  };

  const handleProfessional = () => {
    updateField("workerType", "professional");
    navigation.navigate("ProfessionalRole");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>What kind of work are you looking for?</Text>
        <Text style={styles.subtitle}>We'll personalise your experience.</Text>

        <TouchableOpacity
          style={styles.labourCard}
          onPress={handleLabour}
          activeOpacity={0.9}
        >
          <Text style={styles.cardIcon}>🧱</Text>
          <Text style={styles.cardTitle}>Labour Worker</Text>
          <Text style={styles.cardDesc}>
            Drivers, electricians, plumbers, masons, helpers, delivery workers and more.
          </Text>
          <View style={styles.badgeLabour}>
            <Text style={styles.badgeLabourText}>ACCESSIBILITY-FIRST</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.proCard}
          onPress={handleProfessional}
          activeOpacity={0.9}
        >
          <Text style={styles.cardIcon}>💼</Text>
          <Text style={styles.cardTitle}>Professional</Text>
          <Text style={styles.cardDesc}>
            Accountants, designers, developers, data analysts and office professionals.
          </Text>
          <View style={styles.badgePro}>
            <Text style={styles.badgeProText}>CAREER INTELLIGENCE</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
    paddingBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: COLORS.navy,
    marginBottom: 10,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 32,
    lineHeight: 22,
  },
  labourCard: {
    backgroundColor: "#FFF4ED",
    borderWidth: 1.5,
    borderColor: "#D97706",
    borderRadius: BORDER_RADIUS.lg,
    padding: 22,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  proCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: 22,
    ...SHADOWS.sm,
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.navy,
    marginBottom: 10,
  },
  cardDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
    marginBottom: 18,
  },
  badgeLabour: {
    alignSelf: "flex-start",
    backgroundColor: "#FFEDD5",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  badgeLabourText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.accent,
    letterSpacing: 0.6,
  },
  badgePro: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  badgeProText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 0.6,
  },
});
