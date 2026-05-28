import { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { useOnboarding } from "../../context/OnboardingContext";
import { useI18n } from "../../context/I18nContext";
import { COLORS, BORDER_RADIUS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function ProfessionalReviewScreen({ navigation }) {
  const { onboardingData } = useOnboarding();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  const missingFields = [];
  if (!onboardingData.fullName && !onboardingData.resumeSummary) missingFields.push({ name: "Name", route: "ProfessionalRole" });
  if (!onboardingData.professionalRole) missingFields.push({ name: "Role", route: "ProfessionalRole" });
  if (!onboardingData.professionalSkills || onboardingData.professionalSkills.length === 0) missingFields.push({ name: "Skills", route: "ProfessionalSkills" });
  if (!onboardingData.education?.degree) missingFields.push({ name: "Education", route: "Education" });
  if (!onboardingData.experienceDetails || onboardingData.experienceDetails.length === 0) missingFields.push({ name: "Experience", route: "ProfessionalExperience" });
  if (!onboardingData.expectedSalary?.min) missingFields.push({ name: "Salary Goals", route: "CareerGoals" });
  if (!onboardingData.linkedin) missingFields.push({ name: "LinkedIn", route: "ProfessionalLinks" });

  const handleComplete = async () => {
    if (missingFields.length > 0) {
      Alert.alert(t("missingInfo") || "Missing Information", t("fillRequiredFields") || "Please fill in all required fields before generating your resume.");
      return;
    }

    setLoading(true);
    try {
      const uid = auth.currentUser.uid;
      const userRef = doc(db, "users", uid);

      await updateDoc(userRef, {
        workerType: "professional",
        onboardingCompleted: false, // Set to true only after Resume Approve
        "profile.professionalRole": onboardingData.professionalRole,
        "profile.canonicalRole": onboardingData.professionalRole,
        "profile.education": onboardingData.education,
        "profile.skills": (onboardingData.professionalSkills || []).map(s => String(s).toLowerCase()),
        "profile.professionalSkills": (onboardingData.professionalSkills || []).map(s => String(s).toLowerCase()),
        "profile.experience": Number(onboardingData.experience || 0),
        "profile.experienceDetails": onboardingData.experienceDetails,
        "profile.linkedin": onboardingData.linkedin,
        "profile.github": onboardingData.github || "",
        "profile.portfolio": onboardingData.portfolio || "",
        "profile.certifications": onboardingData.certifications || [],
        "profile.email": onboardingData.email || "",
        "profile.preferredRoles": onboardingData.preferredRoles || [],
        "profile.expectedSalary": onboardingData.expectedSalary || null,
        "profile.careerGoal": onboardingData.careerGoal || "",
        "profile.transcriptHistory": onboardingData.transcriptHistory || [],
        "profile.resumeSummary": onboardingData.resumeSummary || "",
        "profile.fullName": onboardingData.fullName || onboardingData.resumeSummary?.split("|")[0] || "",
        updatedAt: serverTimestamp(),
      });

      setLoading(false);
      navigation.navigate("Resume");

    } catch (error) {
      console.log(error);
      Alert.alert(t("error") || "Error", "Failed to save profile data. Please try again.");
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
      <Text style={styles.title}>{t("reviewProfile") || "Review Profile"}</Text>
      <Text style={styles.subtitle}>{t("reviewSubtitlePro") || "Check your details before generating your AI resume."}</Text>

      {missingFields.length > 0 && (
        <View style={styles.warningBox}>
          <Ionicons name="warning" size={24} color="#B45309" />
          <View style={styles.warningTextContainer}>
            <Text style={styles.warningTitle}>{t("missingInformation") || "Missing Information"}</Text>
            <Text style={styles.warningText}>You haven't added your {missingFields[0].name.toLowerCase()} yet. Add it to complete your profile.</Text>
            <TouchableOpacity onPress={() => navigation.navigate(missingFields[0].route)} style={styles.fillInBtn}>
              <Text style={styles.fillInText}>{t("fillIn") || "Fill in"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <SummaryCard 
        title="Basic Info" 
        value={`${onboardingData.fullName || "No name"} || ${onboardingData.professionalRole || "No role"}`} 
        route="ProfessionalRole" 
      />
      <SummaryCard 
        title="Skills" 
        value={(onboardingData.professionalSkills || []).join(", ") || "None"} 
        route="ProfessionalSkills" 
      />
      <SummaryCard 
        title="Education" 
        value={onboardingData.education ? `${onboardingData.education.degree} - ${onboardingData.education.institution} (${onboardingData.education.graduationYear})` : "None"} 
        route="Education" 
      />
      <SummaryCard 
        title="Experience" 
        value={onboardingData.experienceDetails ? `${onboardingData.experienceDetails.length} roles added (${onboardingData.experience || 0} yrs total)` : "None"} 
        route="ProfessionalExperience" 
      />
      <SummaryCard 
        title="Goals" 
        value={`Salary: ${onboardingData.expectedSalary?.min || "�"} ${onboardingData.expectedSalary?.currency || ""}\nRoles: ${(onboardingData.preferredRoles || []).join(", ") || "�"}`} 
        route="CareerGoals" 
      />
      <SummaryCard 
        title="Links" 
        value={`LinkedIn: ${onboardingData.linkedin || "�"}\nCertifications: ${onboardingData.certifications?.length || 0}`} 
        route="ProfessionalLinks" 
      />

      <TouchableOpacity
        style={[styles.completeButton, (missingFields.length > 0 || loading) && styles.completeButtonDisabled]}
        onPress={handleComplete}
        disabled={missingFields.length > 0 || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.completeText}>{t("saveGenerateResume") || "Save & Generate Resume"}</Text>
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
