import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { useI18n } from "../context/I18nContext";
import { COLORS, BORDER_RADIUS } from "../constants/theme";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { t } = useI18n();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logoBox}>
        <Text style={styles.logoIcon}>🧱</Text>
      </View>

      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to find your next job.</Text>

      <View style={styles.inputRow}>
        <Text style={styles.inputIcon}>✉️</Text>
        <TextInput
          style={styles.input}
          placeholder="Email or phone"
          placeholderTextColor={COLORS.textLight}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.inputIcon}>🔒</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={COLORS.textLight}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.8}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} activeOpacity={0.85}>
        <Text style={styles.primaryBtnText}>{t("login") || "Sign In"}</Text>
      </TouchableOpacity>

      <View style={styles.voiceBox}>
        <Text style={styles.voiceIcon}>🎤</Text>
        <Text style={styles.voiceText}>
          <Text style={styles.voiceAccent}>Voice sign in</Text>
          {" "}available in Hindi, Tamil, Telugu
        </Text>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("Signup")} style={styles.footerLink}>
        <Text style={styles.footerText}>
          New here? <Text style={styles.footerAccent}>Create account</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  container: {
    padding: 24,
    paddingTop: 64,
    paddingBottom: 40,
    alignItems: "stretch",
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
    alignSelf: "center",
  },
  logoIcon: { fontSize: 32 },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.navy,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 32,
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
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.accent,
  },
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
  voiceBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: 14,
    backgroundColor: COLORS.surface,
    marginBottom: 28,
    gap: 10,
  },
  voiceIcon: { fontSize: 18 },
  voiceText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  voiceAccent: {
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
