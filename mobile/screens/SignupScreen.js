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
  createUserWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../services/firebase";
import { useI18n } from "../context/I18nContext";

export default function SignupScreen({
  navigation,
}) {

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const { t } = useI18n();
  /*
    SIGNUP
  */
  const handleSignup =
    async () => {

      try {

        setLoading(true);

        /*
          CREATE AUTH USER
        */
        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        const user =
          userCredential.user;

        /*
          CREATE USER DOC
        */
        await setDoc(
          doc(
            db,
            "users",
            user.uid
          ),
          {

            uid:
              user.uid,

            email,

            role:
              "worker",

            workerType:
              "",

            onboardingCompleted:
              false,

            profile: {},

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          }
        );

      } catch (error) {

        console.log(error);

        alert(
          error.message
        );

      } finally {

        setLoading(false);
      }
    };

  return (

    <View
      style={
        styles.container
      }
    >

      <Text
        style={
          styles.heading
        }
      >
        {t("createAccount") || "Create Account"}
      </Text>

      <TextInput
        style={
          styles.input
        }

        placeholder={t("email") || "Email"}

        value={email}

        onChangeText={
          setEmail
        }

        autoCapitalize="none"
      />

      <TextInput
        style={
          styles.input
        }

        placeholder={t("password") || "Password"}

        secureTextEntry

        value={password}

        onChangeText={
          setPassword
        }
      />

      <TouchableOpacity
        style={
          styles.button
        }

        onPress={
          handleSignup
        }
      >

        <Text
          style={
            styles.buttonText
          }
        >
          {
            loading
              ? (t("creating") || "Creating...")
              : (t("signUp") || "Sign Up")
          }
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          navigation.navigate(
            "Login"
          )
        }
      >

        <Text
          style={
            styles.linkText
          }
        >
          {t("alreadyHaveAccount") || "Already have an account? Login"}
        </Text>

      </TouchableOpacity>

    </View>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,

      justifyContent:
        "center",

      padding: 24,

      backgroundColor:
        "#fff",
    },

    heading: {
      fontSize: 32,

      fontWeight: "bold",

      marginBottom: 40,

      textAlign:
        "center",
    },

    input: {
      borderWidth: 1,

      borderColor:
        "#ccc",

      borderRadius: 12,

      padding: 16,

      marginBottom: 20,
    },

    button: {
      backgroundColor:
        "#27ae60",

      padding: 18,

      borderRadius: 12,

      alignItems:
        "center",
    },

    buttonText: {
      color: "#fff",

      fontSize: 18,

      fontWeight: "bold",
    },

    linkText: {
      marginTop: 20,

      textAlign:
        "center",

      color: "#2980b9",
    },
  });