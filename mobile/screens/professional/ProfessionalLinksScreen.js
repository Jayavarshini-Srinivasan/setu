import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useOnboarding } from "../../context/OnboardingContext";
import { useI18n } from "../../context/I18nContext";
import OnboardingStepLayout, { onboardingStyles as os } from "../../components/OnboardingStepLayout";
import { COLORS, BORDER_RADIUS } from "../../constants/theme";

export default function ProfessionalLinksScreen({ navigation }) {
  const { onboardingData, updateField } = useOnboarding();
  const { t } = useI18n();

  const [linkedin, setLinkedin] = useState(onboardingData.linkedin || "");
  const [github, setGithub] = useState(onboardingData.github || "");
  const [portfolio, setPortfolio] = useState(onboardingData.portfolio || "");

  const [certName, setCertName] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certifications, setCertifications] = useState(onboardingData.certifications || []);

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const isFormValid = linkedin.trim() !== "" && isValidUrl(linkedin);

  const handleAddCert = () => {
    if (certName.trim() && certIssuer.trim()) {
      setCertifications([...certifications, { name: certName.trim(), issuer: certIssuer.trim() }]);
      setCertName("");
      setCertIssuer("");
    }
  };

  const removeCert = (index) => {
    const updated = [...certifications];
    updated.splice(index, 1);
    setCertifications(updated);
  };

  const handleContinue = () => {
    if (!isFormValid) {
      Alert.alert("Invalid URL", "Please provide a valid LinkedIn URL starting with https://");
      return;
    }

    updateField("linkedin", linkedin.trim());
    updateField("github", github.trim());
    updateField("portfolio", portfolio.trim());
    updateField("certifications", certifications);

    navigation.navigate("ProfessionalReview");
  };

  return (
    <OnboardingStepLayout
      navigation={navigation}
      screenTitle="Links (6/6)"
      step={6}
      totalSteps={6}
      badge="PROFESSIONAL"
      title="Links & Certifications"
      subtitle="Help recruiters find your work."
      onContinue={handleContinue}
      continueDisabled={!isFormValid}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        <Text style={os.label}>LINKEDIN URL (REQUIRED)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://linkedin.com/in/..."
          placeholderTextColor={COLORS.textLight}
          value={linkedin}
          onChangeText={setLinkedin}
          autoCapitalize="none"
          keyboardType="url"
        />

        <Text style={os.label}>GITHUB URL (OPTIONAL)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://github.com/..."
          placeholderTextColor={COLORS.textLight}
          value={github}
          onChangeText={setGithub}
          autoCapitalize="none"
          keyboardType="url"
        />

        <Text style={os.label}>PORTFOLIO / WEBSITE (OPTIONAL)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://mywebsite.com"
          placeholderTextColor={COLORS.textLight}
          value={portfolio}
          onChangeText={setPortfolio}
          autoCapitalize="none"
          keyboardType="url"
        />

        <Text style={[os.label, { marginTop: 24 }]}>CERTIFICATIONS (OPTIONAL)</Text>
        <View style={styles.certBox}>
          <TextInput
            style={styles.input}
            placeholder="Certification Name"
            placeholderTextColor={COLORS.textLight}
            value={certName}
            onChangeText={setCertName}
          />
          <TextInput
            style={[styles.input, { marginBottom: 12 }]}
            placeholder="Issuing Organization"
            placeholderTextColor={COLORS.textLight}
            value={certIssuer}
            onChangeText={setCertIssuer}
          />
          <TouchableOpacity 
            style={[styles.addBtn, (!certName.trim() || !certIssuer.trim()) && styles.addBtnDisabled]} 
            onPress={handleAddCert}
            disabled={!certName.trim() || !certIssuer.trim()}
          >
            <Text style={styles.addBtnText}>+ Add Certification</Text>
          </TouchableOpacity>
        </View>

        {certifications.length > 0 && (
          <View style={styles.certList}>
            {certifications.map((cert, index) => (
              <View key={index} style={styles.certChip}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.certName}>{cert.name}</Text>
                  <Text style={styles.certIssuer}>{cert.issuer}</Text>
                </View>
                <TouchableOpacity onPress={() => removeCert(index)}>
                  <Ionicons name="close-circle" size={24} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: 14,
    backgroundColor: COLORS.surface,
    marginBottom: 16,
    fontSize: 15,
  },
  certBox: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    marginTop: 8,
  },
  addBtn: {
    backgroundColor: COLORS.primaryLight,
    padding: 12,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  addBtnText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 14,
  },
  certList: {
    marginTop: 16,
    gap: 8,
  },
  certChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
  },
  certName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
  },
  certIssuer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
