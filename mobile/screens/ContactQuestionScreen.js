import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useOnboarding } from "../context/OnboardingContext";
import { useI18n } from "../context/I18nContext";

export default function ContactQuestionScreen({ navigation }) {
  const { onboardingData, updateField } = useOnboarding();
  const { t } = useI18n();

  const isProfessional = onboardingData.workerType === "professional";

  const [contactVal, setContactVal] = useState(
    isProfessional
      ? onboardingData.email || ""
      : onboardingData.phoneNumber || ""
  );

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneDigits = contactVal.replace(/[^0-9]/g, "");
  const isFormValid = isProfessional
    ? emailRegex.test(contactVal.trim())
    : /^[0-9]{10}$/.test(phoneDigits);

  /*
    CONTINUE
  */
  const handleContinue = () => {
    if (!isFormValid) {
      Alert.alert(
        t("required") || "Required",
        isProfessional
          ? (t("enterValidEmail") || "Please enter a valid email address.")
          : (t("enterValidPhone") || "Please enter a valid 10-digit phone number.")
      );
      return;
    }

    if (isProfessional) {
      updateField("email", contactVal.trim());
      navigation.navigate("ProfessionalReview");
    } else {
      updateField("phoneNumber", phoneDigits);
      navigation.navigate("ReviewOnboarding");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>
        {t("contactInfoTitle") || "Contact Information"}
      </Text>

      <Text style={styles.prompt}>
        {isProfessional
          ? (t("emailPrompt") || "What is your email address?")
          : (t("phonePrompt") || "What is your phone number?")}
      </Text>

      <Text style={styles.subtitle}>
        {isProfessional
          ? (t("emailSubtitle") || "Recruiters will use this to send you interviews and feedback.")
          : (t("phoneSubtitle") || "Employers will use this to contact you for job offers.")}
      </Text>

      <TextInput
        style={styles.input}
        placeholder={
          isProfessional
            ? (t("emailPlaceholder") || "Your email address")
            : (t("phonePlaceholder") || "e.g., 9876543210")
        }
        placeholderTextColor="#9CA3AF"
        value={contactVal}
        onChangeText={setContactVal}
        keyboardType={isProfessional ? "email-address" : "phone-pad"}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity
        style={[styles.button, !isFormValid && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={!isFormValid}
      >
        <Text style={styles.buttonText}>{t("continue") || "Continue"}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    color: "#E85D04",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  prompt: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 18,
    fontSize: 18,
    color: "#111827",
    marginTop: 16,
    marginBottom: 40,
    backgroundColor: "#F9FAFB",
  },
  button: {
    backgroundColor: "#000",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
