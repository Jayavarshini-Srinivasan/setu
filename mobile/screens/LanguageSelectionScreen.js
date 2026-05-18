import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useI18n } from "../context/I18nContext";
import { SUPPORTED_LANGUAGES } from "../constants/translations";

const FLAG_MAP = {
  en: "🇬🇧",
  hi: "🇮🇳",
  ta: "🇮🇳",
  mr: "🇮🇳",
};

export default function LanguageSelectionScreen({ navigation }) {

  const { language, changeLanguage, t } = useI18n();

  const handleSelect = async (code) => {
    await changeLanguage(code);
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* LOGO AREA */}
        <View style={styles.logoArea}>
          <Text style={styles.logo}>सेतु</Text>
          <Text style={styles.logoEn}>SETU</Text>
          <Text style={styles.tagline}>Your bridge to work</Text>
        </View>

        {/* HEADING */}
        <Text style={styles.heading}>{t("chooseLanguage")}</Text>
        <Text style={styles.subheading}>
          {"Choose / चुनें / தேர்ந்தெடு / निवडा"}
        </Text>

        {/* LANGUAGE CARDS */}
        <View style={styles.grid}>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => handleSelect(lang.code)}
                activeOpacity={0.8}
              >
                <Text style={styles.flag}>{FLAG_MAP[lang.code]}</Text>
                <Text style={[styles.nativeLabel, isSelected && styles.nativeLabelSelected]}>
                  {lang.nativeLabel}
                </Text>
                <Text style={[styles.label, isSelected && styles.labelSelected]}>
                  {lang.label}
                </Text>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FAF9F6",
  },
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  logoArea: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#E85D04",
    letterSpacing: 2,
  },
  logoEn: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: 8,
    marginTop: -4,
  },
  tagline: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 6,
    letterSpacing: 1,
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  subheading: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 36,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
    width: "100%",
  },
  card: {
    width: "44%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
  },
  cardSelected: {
    borderColor: "#E85D04",
    backgroundColor: "#FFF4ED",
  },
  flag: {
    fontSize: 36,
    marginBottom: 8,
  },
  nativeLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  nativeLabelSelected: {
    color: "#E85D04",
  },
  label: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  labelSelected: {
    color: "#E85D04",
  },
  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E85D04",
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
