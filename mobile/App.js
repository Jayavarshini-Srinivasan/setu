import "react-native-gesture-handler";

import {
  NavigationContainer,
} from "@react-navigation/native";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  View,
} from "react-native";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  db,
} from "./services/firebase";

import {
  AuthProvider,
  useAuth,
} from "./context/AuthContext";

import {
  OnboardingProvider,
} from "./context/OnboardingContext";

/*
  AUTH SCREENS
*/
import SignupScreen from "./screens/SignupScreen";

import LoginScreen from "./screens/LoginScreen";

/*
  ONBOARDING SCREENS
*/
import RoleQuestionScreen from "./screens/RoleQuestionScreen";

import SkillsQuestionScreen from "./screens/SkillsQuestionScreen";

import ExperienceQuestionScreen from "./screens/ExperienceQuestionScreen";

import LocationQuestionScreen from "./screens/LocationQuestionScreen";

import PreferencesQuestionScreen from "./screens/PreferencesQuestionScreen";

import ReviewOnboardingScreen from "./screens/ReviewOnboardingScreen";

/*
  MAIN APP SCREENS
*/
import HomeScreen from "./screens/HomeScreen";

import ResultsScreen from "./screens/ResultsScreen";

import ProfileScreen from "./screens/ProfileScreen";

/*
  NAVIGATORS
*/
const Stack =
  createNativeStackNavigator();

const Tab =
  createBottomTabNavigator();

/*
  MAIN APP TABS
*/
function WorkerTabs() {

  return (

    <Tab.Navigator>

      <Tab.Screen
        name="Profile"
        component={
          ProfileScreen
        }
      />

      <Tab.Screen
        name="Home"
        component={
          HomeScreen
        }
      />

      <Tab.Screen
        name="Results"
        component={
          ResultsScreen
        }
      />

    </Tab.Navigator>
  );
}

/*
  APP NAVIGATOR
*/
function AppNavigator() {

  const {
    user,
  } = useAuth();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    onboardingCompleted,
    setOnboardingCompleted,
  ] = useState(false);

  /*
    CHECK PROFILE
  */
  useEffect(() => {

    checkProfile();

  }, [user]);

  const checkProfile =
    async () => {

      try {

        /*
          NO USER
        */
        if (!user) {

          setLoading(false);

          return;
        }

        /*
          USER DOC
        */
        const userRef =
          doc(
            db,
            "users",
            user.uid
          );

        const userSnap =
          await getDoc(
            userRef
          );

        /*
          PROFILE EXISTS
        */
        if (
          userSnap.exists()
        ) {

          const userData =
            userSnap.data();

          /*
            TEMPORARY:
            FORCE ONBOARDING
          */
          setOnboardingCompleted(
            userData.onboardingCompleted || false
          );
        }

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);
      }
    };

  /*
    LOADING
  */
  if (loading) {

    return (

      <View
        style={{
          flex: 1,

          justifyContent:
            "center",

          alignItems:
            "center",
        }}
      >

        <ActivityIndicator
          size="large"
        />

      </View>
    );
  }

  /*
    AUTH FLOW
  */
  if (!user) {

    return (

      <Stack.Navigator>

        <Stack.Screen
          name="Login"
          component={
            LoginScreen
          }
        />

        <Stack.Screen
          name="Signup"
          component={
            SignupScreen
          }
        />

      </Stack.Navigator>
    );
  }

  /*
    ONBOARDING FLOW
  */
  if (
    !onboardingCompleted
  ) {

    return (

      <Stack.Navigator>

        <Stack.Screen
          name="RoleQuestion"
          component={
            RoleQuestionScreen
          }
        />

        <Stack.Screen
          name="SkillsQuestion"
          component={
            SkillsQuestionScreen
          }
        />

        <Stack.Screen
          name="ExperienceQuestion"
          component={
            ExperienceQuestionScreen
          }
        />

        <Stack.Screen
          name="LocationQuestion"
          component={
            LocationQuestionScreen
          }
        />

        <Stack.Screen
          name="PreferencesQuestion"
          component={
            PreferencesQuestionScreen
          }
        />

        <Stack.Screen
          name="ReviewOnboarding"
          component={
            ReviewOnboardingScreen
          }
        />

      </Stack.Navigator>
    );
  }

  /*
    MAIN APP
  */
  return <WorkerTabs />;
}

/*
  ROOT APP
*/
export default function App() {

  return (

    <AuthProvider>

      <OnboardingProvider>

        <NavigationContainer>

          <AppNavigator />

        </NavigationContainer>

      </OnboardingProvider>

    </AuthProvider>
  );
}