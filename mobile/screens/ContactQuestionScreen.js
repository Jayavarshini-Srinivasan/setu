import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
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

  /*
    CONTINUE
  */
  const handleContinue = () => {
    if (!contactVal.trim()) {
      Alert.alert(
        t("required") || "Required",
        isProfessional
          ? (t("enterValidEmail") || "Please enter a valid email address.")
          : (t("enterValidPhone") || "Please enter a valid 10-digit phone number.")
      );
      return;
    }

    if (isProfessional) {
      // Basic Email Regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactVal.trim())) {
        Alert.alert(t("error") || "Error", t("enterValidEmail") || "Please enter a valid email address.");
        return;
      }
      updateField("email", contactVal.trim());
      navigation.navigate("ProfessionalReview");
    } else {
      // Basic Phone Regex (10 digits)
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(contactVal.replace(/[^0-9]/g, ""))) {
        Alert.alert(t("error") || "Error", t("enterValidPhone") || "Please enter a valid 10-digit phone number.");
        return;
      }
      updateField("phoneNumber", contactVal.replace(/[^0-9]/g, ""));
      navigation.navigate("ReviewOnboarding");
    }
  };

  return (
    <View style={styles.container}>
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
            ? (t("emailPlaceholder") || "e.g., candidate@example.com")
            : (t("phonePlaceholder") || "e.g., 9876543210")
        }
        placeholderTextColor="#6B6B80"
        value={contactVal}
        onChangeText={setContactVal}
        keyboardType={isProfessional ? "email-address" : "phone-pad"}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>{t("continue") || "Continue"}</Text>
      </TouchableOpacity>
    </View>
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
    color: "#E85D26",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  prompt: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A2E",
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
    borderColor: "rgba(26,26,46,0.12)",
    borderRadius: 16,
    padding: 18,
    fontSize: 18,
    color: "#1A1A2E",
    marginBottom: 40,
    backgroundColor: "#F7F5F2",
  },
  button: {
    backgroundColor: "#000",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
