import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { useOnboarding } from "../context/OnboardingContext";
import { useI18n } from "../context/I18nContext";
import { COLORS, BORDER_RADIUS } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function ReviewOnboardingScreen({ navigation }) {
  const { onboardingData, resetOnboarding, refreshOnboarding } = useOnboarding();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  const missingFields = [];
  if (!onboardingData.fullName && !onboardingData.resumeSummary) missingFields.push({ name: "Name", route: "RoleQuestion" });
  if (!onboardingData.role) missingFields.push({ name: "Role", route: "RoleQuestion" });
  if (!onboardingData.skills || onboardingData.skills.length === 0) missingFields.push({ name: "Skills", route: "SkillsQuestion" });
  if (onboardingData.experience === undefined || onboardingData.experience === "") missingFields.push({ name: "Experience", route: "ExperienceQuestion" });
  if (!onboardingData.location) missingFields.push({ name: "Location", route: "LocationQuestion" });
  if (!onboardingData.workRadius) missingFields.push({ name: "Work Radius", route: "LocationQuestion" });
  if (!onboardingData.expectedWage) missingFields.push({ name: "Expected Wage", route: "PreferencesQuestion" });
  if (!onboardingData.availability) missingFields.push({ name: "Availability", route: "PreferencesQuestion" });
  if (!onboardingData.preferredShift) missingFields.push({ name: "Preferred Shift", route: "PreferencesQuestion" });

  const handleComplete = async () => {
    if (missingFields.length > 0) {
      Alert.alert(t("missingInfo") || "Missing Information", t("fillRequiredFields") || "Please fill in all required fields before completing your profile.");
      return;
    }

    setLoading(true);
    try {
      const uid = auth.currentUser.uid;
      const userRef = doc(db, "users", uid);

      await updateDoc(userRef, {
        workerType: "labour",
        onboardingCompleted: true,
        "profile.role": onboardingData.role,
        "profile.canonicalRole": onboardingData.canonicalRole || onboardingData.role,
        "profile.skills": (onboardingData.skills || []).map(s => String(s).toLowerCase()),
        "profile.experience": Number(onboardingData.experience || 0),
        "profile.age": onboardingData.age ? Number(onboardingData.age) : null,
        "profile.location": onboardingData.location,
        "profile.workRadius": onboardingData.workRadius,
        "profile.expectedWage": onboardingData.expectedWage,
        "profile.labourData.availability": onboardingData.availability,
        "profile.labourData.preferredShift": onboardingData.preferredShift,
        "profile.labourData.transportAccess": Boolean(onboardingData.transportAccess),
        "profile.transcriptHistory": onboardingData.transcriptHistory || [],
        "profile.fullName": onboardingData.fullName || onboardingData.resumeSummary?.split("|")[0] || "",
        updatedAt: serverTimestamp()
      });

      refreshOnboarding();
      resetOnboarding();
    } catch (error) {
      console.log(error);
      Alert.alert(t("error") || "Error", t("failedOnboarding") || "Failed to complete onboarding. Please try again.");
      setLoading(false);
    }
  };

  const SummaryCard = ({ title, value, route }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <TouchableOpacity onPress={() => navigation.navigate(route)}>
          <Text style={styles.editLink}>{t("edit") || "Edit"}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.cardValue}>{value || "�"}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t("reviewConfirm") || "Review & Confirm"}</Text>
      <Text style={styles.subtitle}>{t("reviewSubtitleLabour") || "Check your details before we find you the best jobs."}</Text>

      {missingFields.length > 0 && (
        <View style={styles.warningBox}>
          <Ionicons name="warning" size={24} color="#B45309" />
          <View style={styles.warningTextContainer}>
            <Text style={styles.warningTitle}>{t("missingInformation") || "Missing Information"}</Text>
            <Text style={styles.warningText}>You haven't added your {missingFields[0].name.toLowerCase()} yet. Add it to get better job matches.</Text>
            <TouchableOpacity onPress={() => navigation.navigate(missingFields[0].route)} style={styles.fillInBtn}>
              <Text style={styles.fillInText}>{t("fillIn") || "Fill in"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <SummaryCard title="Basic Info" value={`${onboardingData.fullName || onboardingData.resumeSummary?.split("|")[0] || "No name"} || ${onboardingData.role || "No role"}`} route="RoleQuestion" />
      <SummaryCard title="Skills" value={(onboardingData.skills || []).join(", ") || "None selected"} route="SkillsQuestion" />
      <SummaryCard title="Experience & Age" value={`${onboardingData.experience !== undefined ? onboardingData.experience + " years" : "No experience"} ${onboardingData.age ? "|| " + onboardingData.age + " yrs old" : ""}`} route="ExperienceQuestion" />
      <SummaryCard title="Location" value={`${onboardingData.location || "No city"} || ${onboardingData.workRadius || "No radius"}`} route="LocationQuestion" />
      <SummaryCard title="Preferences" value={`Wage: ${onboardingData.expectedWage || "�"}\nAvailability: ${onboardingData.availability || "�"} || ${onboardingData.preferredShift || "�"}\nVehicle: ${onboardingData.transportAccess ? "Yes" : "No"}`} route="PreferencesQuestion" />

      <TouchableOpacity
        style={[styles.completeButton, (missingFields.length > 0 || loading) && styles.completeButtonDisabled]}
        onPress={handleComplete}
        disabled={missingFields.length > 0 || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.completeText}>{t("confirmFinish") || "Confirm & Finish"}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: COLORS.background, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: "bold", color: COLORS.navy, marginTop: 40, marginBottom: 8 },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 24 },
  warningBox: { flexDirection: "row", backgroundColor: "#FEF3C7", padding: 16, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: "#FCD34D", marginBottom: 20 },
  warningTextContainer: { marginLeft: 12, flex: 1 },
  warningTitle: { fontSize: 16, fontWeight: "bold", color: "#92400E", marginBottom: 4 },
  warningText: { fontSize: 14, color: "#92400E", marginBottom: 12 },
  fillInBtn: { backgroundColor: "#D97706", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignSelf: "flex-start" },
  fillInText: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
  card: { backgroundColor: COLORS.surface, padding: 16, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary },
  editLink: { fontSize: 14, fontWeight: "bold", color: COLORS.primary },
  cardValue: { fontSize: 16, color: COLORS.text, fontWeight: "500", lineHeight: 22 },
  completeButton: { backgroundColor: COLORS.primary, padding: 18, borderRadius: BORDER_RADIUS.md, alignItems: "center", marginTop: 24 },
  completeButtonDisabled: { backgroundColor: COLORS.textLight },
  completeText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
