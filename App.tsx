// Tarek Chaalan
// Project Completed: May 3, 2024

import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { auth } from "./firebase";
import { UserProvider } from "./UserContext";
import { View, ActivityIndicator, StyleSheet } from "react-native";

// Import all screens
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import Forgot from "./screens/Forgot";
import Dashboard from "./screens/Dashboard";
import Workouts from "./screens/Workouts";
import ScanEquipment from "./screens/ScanEquipment";
import EquipmentResult from "./screens/EquipmentResult";
import WorkoutPlan from "./screens/WorkoutPlan";
import WorkoutDetails from "./screens/WorkoutDetails";
import ProgressTracker from "./screens/ProgressTracker";
import Meals from "./screens/Meals";
import MealPlan from "./screens/MealPlan";
import MealDetails from "./screens/MealDetails";
import InputIngredients from "./screens/InputIngredients";
import IngredientsResult from "./screens/IngredientsResult";
import MacroChecker from "./screens/MacroChecker";
import BarcodeResults from "./screens/BarcodeResults";
import MacroResult from "./screens/MacroResult";
import Preferences from "./screens/Preferences";
import Profile from "./screens/Profile";

const Stack = createStackNavigator();

interface User {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await SplashScreen.preventAutoHideAsync();
        await Font.loadAsync({
          "SFProText-Heavy": require("./assets/fonts/SFProText/SFProTextHeavy.otf"),
          "SFProText-Regular": require("./assets/fonts/SFProText/SFProTextRegular.otf"),
          "SFProText-Light": require("./assets/fonts/SFProText/SFProTextLight.otf"),
          "SFProText-Ultralight": require("./assets/fonts/SFProText/SFProTextUltralight.otf"),
          "SFProRounded-Heavy": require("./assets/fonts/SFProRounded/SFProRoundedHeavy.otf"),
          "SFProRounded-Regular": require("./assets/fonts/SFProRounded/SFProRoundedRegular.otf"),
          "SFProRounded-Light": require("./assets/fonts/SFProRounded/SFProRoundedLight.otf"),
          "SFProRounded-Ultralight": require("./assets/fonts/SFProRounded/SFProRoundedUltralight.otf"),
        });
      } catch (error) {
        console.warn("Failed to load fonts", error);
      } finally {
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      }
    }
    loadFonts();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            // Main App Screens
            <>
              <Stack.Screen name="Dashboard" component={Dashboard} />
              <Stack.Screen name="Workouts" component={Workouts} />
              <Stack.Screen name="ScanEquipment" component={ScanEquipment} />
              <Stack.Screen
                name="EquipmentResult"
                component={EquipmentResult}
              />
              <Stack.Screen
                name="ProgressTracker"
                component={ProgressTracker}
              />
              <Stack.Screen name="WorkoutPlan" component={WorkoutPlan} />
              <Stack.Screen name="WorkoutDetails" component={WorkoutDetails} />
              <Stack.Screen name="Meals" component={Meals} />
              <Stack.Screen name="MealPlan" component={MealPlan} />
              <Stack.Screen name="MealDetails" component={MealDetails} />
              <Stack.Screen
                name="InputIngredients"
                component={InputIngredients}
              />
              <Stack.Screen
                name="IngredientsResult"
                component={IngredientsResult}
              />
              <Stack.Screen name="MacroChecker" component={MacroChecker} />
              <Stack.Screen name="BarcodeResults" component={BarcodeResults} />
              <Stack.Screen name="MacroResult" component={MacroResult} />
              <Stack.Screen name="Preferences" component={Preferences} />
              <Stack.Screen name="Profile" component={Profile} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Signup" component={Signup} />
              <Stack.Screen name="Forgot" component={Forgot} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});

export default App;
