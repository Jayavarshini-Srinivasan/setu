
import "react-native-gesture-handler";

import {NavigationContainer,} from "@react-navigation/native";

import {createNativeStackNavigator,} from "@react-navigation/native-stack";

import {createBottomTabNavigator,} from "@react-navigation/bottom-tabs";

import {useEffect,useState,} from "react";

import {ActivityIndicator,View,} from "react-native";

import {doc,getDoc,} from "firebase/firestore";

import {db,} from "./services/firebase";

import { AuthProvider, useAuth } from "./context/AuthContext";

import { OnboardingProvider, useOnboarding } from "./context/OnboardingContext";

import { I18nProvider } from "./context/I18nContext";

import LanguageSelectionScreen from "./screens/LanguageSelectionScreen";

import ResumePreviewScreen from "./screens/professional/ResumePreviewScreen";

/*
  AUTH
*/
import SignupScreen from "./screens/SignupScreen";

import LoginScreen from "./screens/LoginScreen";

/*
  USER TYPE
*/
import UserTypeSelectionScreen from "./screens/UserTypeSelectionScreen";

/*
  LABOUR
*/
import RoleQuestionScreen from "./screens/RoleQuestionScreen";

import SkillsQuestionScreen from "./screens/SkillsQuestionScreen";

import ExperienceQuestionScreen from "./screens/ExperienceQuestionScreen";

import LocationQuestionScreen from "./screens/LocationQuestionScreen";

import PreferencesQuestionScreen from "./screens/PreferencesQuestionScreen";

import ReviewOnboardingScreen from "./screens/ReviewOnboardingScreen";

/*
  PROFESSIONAL
*/
import ProfessionalRoleScreen from "./screens/professional/ProfessionalRoleScreen";

import EducationScreen from "./screens/professional/EducationScreen";

import ProfessionalSkillsScreen from "./screens/professional/ProfessionalSkillsScreen";

import ProfessionalExperienceScreen from "./screens/professional/ProfessionalExperienceScreen";

import ProfessionalLinksScreen from "./screens/professional/ProfessionalLinksScreen";

import CareerGoalsScreen from "./screens/professional/CareerGoalsScreen";

import ProfessionalReviewScreen from "./screens/professional/ProfessionalReviewScreen";

import LearningPathScreen from "./screens/professional/LearningPathScreen";
/*
  MAIN APP
*/
import HomeScreen from "./screens/HomeScreen";

import ResultsScreen from "./screens/ResultsScreen";

import ProfileScreen from "./screens/ProfileScreen";

const Stack =
  createNativeStackNavigator();

const Tab =
  createBottomTabNavigator();

/*
  APP TABS
*/
function LabourTabs() {

  return (

    <Tab.Navigator>

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

      <Tab.Screen
        name="Profile"
        component={
          ProfileScreen
        }
      />

    </Tab.Navigator>
  );
}

function ProfessionalTabs() {

  return (

    <Tab.Navigator>

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

      <Tab.Screen
        name="Resume"
        component={
          ResumePreviewScreen
        }
      />
      <Tab.Screen
        name="Learning"
        component={
          LearningPathScreen
        }
      />
      <Tab.Screen
        name="Profile"
        component={
          ProfileScreen
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
    loading: authLoading,
  } = useAuth();

  const {
    onboardingRefresh,
  } = useOnboarding();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    onboardingCompleted,
    setOnboardingCompleted,
  ] = useState(false);

  const [
    workerType,
    setWorkerType,
  ] = useState("");

  /*
    CHECK PROFILE
  */
  useEffect(() => {

    checkProfile();

  }, [
    user,
    onboardingRefresh,
  ]);

  const checkProfile =
    async () => {

      try {

        if (!user) {

          setLoading(false);

          return;
        }

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

        if (
          userSnap.exists()
        ) {

          const userData =
            userSnap.data();
          setWorkerType(
            userData.workerType || ""
          );
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
    LOADING — wait for BOTH auth AND profile check
  */
  if (authLoading || loading) {

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
    AUTH FLOW — Language first, then Login/Signup
  */
  if (!user) {

    return (

      <Stack.Navigator>

        <Stack.Screen
          name="LanguageSelection"
          component={LanguageSelectionScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />

        <Stack.Screen
          name="Signup"
          component={SignupScreen}
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
          name="UserTypeSelection"
          component={
            UserTypeSelectionScreen
          }
        />


        {/* LABOUR */}

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

        {/* PROFESSIONAL */}

        <Stack.Screen
          name="ProfessionalRole"
          component={
            ProfessionalRoleScreen
          }
        />

        <Stack.Screen
          name="Education"
          component={
            EducationScreen
          }
        />

        <Stack.Screen
          name="ProfessionalSkills"
          component={
            ProfessionalSkillsScreen
          }
        />

        <Stack.Screen
          name="ProfessionalExperience"
          component={
            ProfessionalExperienceScreen
          }
        />

        <Stack.Screen
          name="ProfessionalLinks"
          component={
            ProfessionalLinksScreen
          }
        />

        <Stack.Screen
          name="CareerGoals"
          component={
            CareerGoalsScreen
          }
        />

        <Stack.Screen
          name="ProfessionalReview"
          component={
            ProfessionalReviewScreen
          }
        />


      </Stack.Navigator>
    );
  }

  /*
    MAIN APP
  */
  if (
    workerType ===
    "professional"
  ) {

    return (
      <ProfessionalTabs />
    );
  }

  return <LabourTabs />;
}

/*
  ROOT APP
*/
export default function App() {

  return (

    <I18nProvider>

      <AuthProvider>

        <OnboardingProvider>

          <NavigationContainer>

            <AppNavigator />

          </NavigationContainer>

        </OnboardingProvider>

      </AuthProvider>

    </I18nProvider>
  );
}