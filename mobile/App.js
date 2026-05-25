
import "react-native-gesture-handler";

import {NavigationContainer,} from "@react-navigation/native";

import {createNativeStackNavigator,} from "@react-navigation/native-stack";

import {createBottomTabNavigator,} from "@react-navigation/bottom-tabs";

import {useEffect,useState,} from "react";

import { ActivityIndicator, View, Text } from "react-native";

import {doc,getDoc,} from "firebase/firestore";

import {db,} from "./services/firebase";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppliedJobsProvider } from "./context/AppliedJobsContext";

import { OnboardingProvider, useOnboarding } from "./context/OnboardingContext";

import { SafeAreaProvider } from "react-native-safe-area-context";
import { I18nProvider, useI18n } from "./context/I18nContext";

import LanguageSelectionScreen from "./screens/LanguageSelectionScreen";

import ResumePreviewScreen from "./screens/professional/ResumePreviewScreen";

import { Ionicons } from "@expo/vector-icons";

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

import NotificationsScreen from "./screens/NotificationsScreen";

import LearningPathScreen from "./screens/professional/LearningPathScreen";
import SplashScreen from "./screens/SplashScreen";
import ContactQuestionScreen from "./screens/ContactQuestionScreen";

/*
  NEW CUSTOM UI SCREENS
*/
import AppliedScreen from "./screens/AppliedScreen";
import AIAnalysisScreen from "./screens/AIAnalysisScreen";
import ApplySuccessScreen from "./screens/ApplySuccessScreen";

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
  TAB STYLING FUNCTION
*/
const TAB_EMOJI = {
  Home: "🏠",
  Jobs: "🔍",
  Applied: "📋",
  Profile: "👤",
};

const getTabScreenOptions = ({ route }) => ({
  tabBarIcon: ({ focused }) => (
    <View style={{ alignItems: "center", justifyContent: "center", minWidth: 48 }}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.55 }}>
        {TAB_EMOJI[route.name] || "•"}
      </Text>
      {focused && (
        <View
          style={{
            width: 28,
            height: 3,
            backgroundColor: "#E86332",
            borderRadius: 2,
            marginTop: 4,
          }}
        />
      )}
    </View>
  ),
  tabBarActiveTintColor: "#E86332",
  tabBarInactiveTintColor: "#757E91",
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  tabBarStyle: {
    height: 64,
    paddingBottom: 6,
    paddingTop: 6,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8E6E1",
  },
  headerShown: false,
});

/*
  APP TABS
*/
function LabourTabs() {
  const { t } = useI18n();

  return (
    <Tab.Navigator screenOptions={getTabScreenOptions}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: t("tabs.home") || "Home" }}
      />
      <Tab.Screen
        name="Jobs"
        component={ResultsScreen}
        options={{ tabBarLabel: t("tabs.jobs") || "Jobs" }}
      />
      <Tab.Screen
        name="Applied"
        component={AppliedScreen}
        options={{ tabBarLabel: t("tabs.applied") || "Applied" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: t("tabs.profile") || "Profile" }}
      />
    </Tab.Navigator>
  );
}

function ProfessionalTabs() {
  const { t } = useI18n();

  return (
    <Tab.Navigator screenOptions={getTabScreenOptions}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: t("tabs.home") || "Home" }}
      />
      <Tab.Screen
        name="Jobs"
        component={ResultsScreen}
        options={{ tabBarLabel: t("tabs.jobs") || "Jobs" }}
      />
      <Tab.Screen
        name="Applied"
        component={AppliedScreen}
        options={{ tabBarLabel: t("tabs.applied") || "Applied" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: t("tabs.profile") || "Profile" }}
      />
    </Tab.Navigator>
  );
}

/*
  LABOUR APP STACK
  Wraps the tabs so Notifications can be pushed as a full-screen Stack route.
*/
function LabourApp() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="LabourTabs"
        component={LabourTabs}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: true, title: "" }}
      />
      <Stack.Screen
        name="AIAnalysis"
        component={AIAnalysisScreen}
      />
      <Stack.Screen
        name="ApplySuccess"
        component={ApplySuccessScreen}
      />
    </Stack.Navigator>
  );
}

/*
  PROFESSIONAL APP STACK
  Wraps the tabs so LearningPath can be pushed
  as a full-screen Stack route with route.params.
*/
function ProfessionalApp() {

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      <Stack.Screen
        name="ProfessionalTabs"
        component={ProfessionalTabs}
      />

      <Stack.Screen
        name="LearningPath"
        component={LearningPathScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Resume"
        component={ResumePreviewScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: true, title: "" }}
      />

      <Stack.Screen
        name="AIAnalysis"
        component={AIAnalysisScreen}
      />

      <Stack.Screen
        name="ApplySuccess"
        component={ApplySuccessScreen}
      />

    </Stack.Navigator>
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
    return <SplashScreen />;
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

        <Stack.Screen
          name="ContactQuestion"
          component={
            ContactQuestionScreen
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
      <ProfessionalApp />
    );
  }

  return <LabourApp />;
}

/*
  ROOT APP
*/
export default function App() {

  return (

    <SafeAreaProvider>
      <I18nProvider>
        <AuthProvider>
          <AppliedJobsProvider>
            <OnboardingProvider>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </OnboardingProvider>
          </AppliedJobsProvider>
        </AuthProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}