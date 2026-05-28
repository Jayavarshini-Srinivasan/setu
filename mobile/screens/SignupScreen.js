import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useI18n } from "../context/I18nContext";
import { SUPPORTED_LANGUAGES } from "../constants/translations";
import { COLORS, BORDER_RADIUS } from "../constants/theme";

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState(SUPPORTED_LANGUAGES[0].nativeLabel);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t, changeLanguage } = useI18n();

  const handleSignup = async () => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const langCode =
        SUPPORTED_LANGUAGES.find((l) => l.nativeLabel === language || l.label === language)?.code ||
        "en";

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        role: "worker",
        workerType: "",
        onboardingCompleted: false,
        profile: {
          fullName: fullName.trim() || undefined,
          phoneNumber: phone.replace(/[^0-9]/g, "") || undefined,
          skills: [],
          experience: 0,
          canonicalRole: "",
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      await changeLanguage(langCode);
    } catch (error) {
      console.log(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>{t("createAccount") || "Create account"}</Text>
      <Text style={styles.subtitle}>{t("joinThousands") || "Join thousands finding work every day."}</Text>

      <View style={styles.inputRow}>
        <Text style={styles.inputIcon}>👤</Text>
        <TextInput
          style={styles.input}
          placeholder={t("fullName") || "Full name"}
          placeholderTextColor={COLORS.textLight}
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.inputIcon}>✉️</Text>
        <TextInput
          style={styles.input}
          placeholder={t("email") || "Email address"}
          placeholderTextColor={COLORS.textLight}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.inputIcon}>📱</Text>
        <TextInput
          style={styles.input}
          placeholder={t("phone") || "Phone number"}
          placeholderTextColor={COLORS.textLight}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.inputIcon}>🔒</Text>
        <TextInput
          style={styles.input}
          placeholder={t("createPassword") || "Create password"}
          placeholderTextColor={COLORS.textLight}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <Text style={styles.fieldLabel}>{(t("preferredLanguage") || "Preferred language").toUpperCase()}</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setShowLangPicker(!showLangPicker)}
        activeOpacity={0.8}
      >
        <Text style={styles.dropdownText}>{language}</Text>
        <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
      {showLangPicker && (
        <View style={styles.pickerList}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={styles.pickerItem}
              onPress={() => {
                setLanguage(lang.nativeLabel);
                setShowLangPicker(false);
              }}
            >
              <Text style={styles.pickerItemText}>{lang.nativeLabel}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={handleSignup}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryBtnText}>{t("signUp") || "Create Account"}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{t("orDivider") || "or"}</Text>
        <View style={styles.dividerLine} />
      </View>


      <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.footerLink}>
        <Text style={styles.footerText}>
          {t("hasAccount") || "Already have an account? Sign in"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  container: {
    padding: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.navy,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 28,
    lineHeight: 22,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textLight,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  dropdownText: { fontSize: 16, color: COLORS.text },
  pickerList: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginTop: -16,
    marginBottom: 20,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerItemText: { fontSize: 16, color: COLORS.text },
  primaryBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 18,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
    marginBottom: 20,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 12,
    color: COLORS.textLight,
    fontSize: 14,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 16,
    marginBottom: 24,
    gap: 10,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.accent,
  },
  googleText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.accent,
  },
  footerLink: { alignItems: "center" },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  footerAccent: {
    color: COLORS.accent,
    fontWeight: "700",
  },
});
