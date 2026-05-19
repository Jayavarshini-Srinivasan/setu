import { useState } from "react";

import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../services/firebase";
import { useI18n } from "../context/I18nContext";

export default function LoginScreen({navigation}) {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");
  const { t } = useI18n();
  const handleLogin = async () => {
    try {
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      console.log(
        "Logged in:",
        userCredential.user.email
      );

    } catch (error) {
      console.log(error);

      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        {t("login") || "Login"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder={t("email") || "Email"}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder={t("password") || "Password"}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button
        title={t("login") || "Login"}
        onPress={handleLogin}
      />
      <TouchableOpacity
        onPress={() =>
          navigation.navigate(
            "Signup"
          )
        }
      >

        <Text
          style={{
            marginTop: 20,

            textAlign:
              "center",

            color:
              "#2980b9",
          }}
        >
          {t("dontHaveAccount") || "Don't have an account? Sign Up"}
        </Text>

      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  heading: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 15,
  },
});