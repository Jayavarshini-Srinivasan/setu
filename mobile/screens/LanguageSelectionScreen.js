import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useI18n } from "../context/I18nContext";
import { SUPPORTED_LANGUAGES } from "../constants/translations";
import { COLORS, BORDER_RADIUS } from "../constants/theme";

const SUBTITLE =
  "अपनी भाषा चुनें · உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்";

export default function LanguageSelectionScreen({ navigation }) {
  const { language, changeLanguage, t } = useI18n();
  const [selected, setSelected] = useState(language || "en");

  const goToLogin = async (code) => {
    setSelected(code);
    await changeLanguage(code);
    navigation.navigate("Login");
  };

  const handleContinue = () => goToLogin(selected);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconBox}>
          <Text style={styles.globeIcon}>🌐</Text>
        </View>

        <Text style={styles.heading}>{t("chooseLanguage") || "Choose your language"}</Text>
        <Text style={styles.subheading}>{SUBTITLE}</Text>

        <View style={styles.list}>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selected === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langRow, isSelected && styles.langRowSelected]}
                onPress={() => goToLogin(lang.code)}
                activeOpacity={0.85}
              >
                <Text style={[styles.langLabel, isSelected && styles.langLabelSelected]}>
                  {lang.nativeLabel}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.accent} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>{t("continue") || "Continue"}</Text>
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
    paddingBottom: 32,
    alignItems: "stretch",
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: "#F5E6E0",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 24,
  },
  globeIcon: {
    fontSize: 28,
  },
  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: COLORS.navy,
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  list: {
    gap: 10,
    marginBottom: 28,
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  langRowSelected: {
    backgroundColor: "#FFF4ED",
    borderColor: COLORS.accent,
    borderWidth: 1.5,
  },
  langLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.text,
  },
  langLabelSelected: {
    color: COLORS.accent,
  },
  continueBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 18,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
  },
  continueBtnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
