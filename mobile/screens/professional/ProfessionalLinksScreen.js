import {
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import {
  useOnboarding,
} from "../../context/OnboardingContext";
import { useI18n } from "../../context/I18nContext";

export default function ProfessionalLinksScreen({
  navigation,
}) {

  /*
    CONTEXT
  */
  const {
    onboardingData,

    updateField,
  } = useOnboarding();
  const { t } = useI18n();

  /*
    LOCAL STATE
  */
  const [
    linkedin,
    setLinkedin,
  ] = useState(
    onboardingData.linkedin || ""
  );

  const [
    github,
    setGithub,
  ] = useState(
    onboardingData.github || ""
  );

  const [
    portfolio,
    setPortfolio,
  ] = useState(
    onboardingData.portfolio || ""
  );

  /*
    CONTINUE
  */
  const handleContinue =
    () => {

      /*
        SAVE LINKS
      */
      updateField(
        "linkedin",
        linkedin
      );

      updateField(
        "github",
        github
      );

      updateField(
        "portfolio",
        portfolio
      );

      navigation.navigate(
        "CareerGoals"
      );
    };

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        {t("links.title") || "Add your professional links"}
      </Text>

      <Text style={styles.subtitle}>
        {t("links.subtitle") || "These links help recruiters and AI understand your work better."}
      </Text>

      <TextInput
        style={styles.input}

        placeholder={t("links.linkedinPlaceholder") || "LinkedIn URL"}

        value={linkedin}

        onChangeText={setLinkedin}

        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}

        placeholder={t("links.githubPlaceholder") || "GitHub URL"}

        value={github}

        onChangeText={setGithub}

        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}

        placeholder={t("links.portfolioPlaceholder") || "Portfolio URL"}

        value={portfolio}

        onChangeText={setPortfolio}

        autoCapitalize="none"
      />

      <TouchableOpacity
        style={styles.button}

        onPress={handleContinue}
      >

        <Text style={styles.buttonText}>
          {t("continue") || "Continue"}
        </Text>

      </TouchableOpacity>

    </View>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,

      backgroundColor:
        "#fff",

      padding: 24,

      justifyContent:
        "center",
    },

    title: {
      fontSize: 30,

      fontWeight: "bold",

      marginBottom: 12,
    },

    subtitle: {
      fontSize: 16,

      color: "#666",

      marginBottom: 40,
    },

    input: {
      borderWidth: 1,

      borderColor:
        "#ddd",

      borderRadius: 14,

      padding: 18,

      fontSize: 16,

      marginBottom: 20,
    },

    button: {
      backgroundColor:
        "#000",

      padding: 20,

      borderRadius: 16,

      alignItems:
        "center",

      marginTop: 20,
    },

    buttonText: {
      color: "#fff",

      fontSize: 18,

      fontWeight: "bold",
    },
  });