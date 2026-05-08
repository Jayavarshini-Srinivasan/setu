import "react-native-gesture-handler";

import { NavigationContainer } from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./screens/HomeScreen";

import OnboardingScreen from "./screens/OnboardingScreen";

import ResultsScreen from "./screens/ResultsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />

        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
        />

        <Stack.Screen
          name="Results"
          component={ResultsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}