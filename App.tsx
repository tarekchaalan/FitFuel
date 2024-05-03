import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { auth } from "./firebase";
import { UserProvider } from "./UserContext";

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
  const [initialRoute, setInitialRoute] = useState("Dashboard");
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          // Assuming you have these fonts or replace with your own
          "SFProText-Heavy": require("./assets/fonts/SF Pro Text/SF-Pro-Text-Heavy.otf"),
          "SFProText-Regular": require("./assets/fonts/SF Pro Text/SF-Pro-Text-Regular.otf"),
          "SFProText-Light": require("./assets/fonts/SF Pro Text/SF-Pro-Text-Light.otf"),
          "SFProText-Ultralight": require("./assets/fonts/SF Pro Text/SF-Pro-Text-Ultralight.otf"),
          "SFProRounded-Heavy": require("./assets/fonts/SF Pro Rounded/SF-Pro-Rounded-Heavy.otf"),
          "SFProRounded-Regular": require("./assets/fonts/SF Pro Rounded/SF-Pro-Rounded-Regular.otf"),
          "SFProRounded-Light": require("./assets/fonts/SF Pro Rounded/SF-Pro-Rounded-Light.otf"),
          "SFProRounded-Ultralight": require("./assets/fonts/SF Pro Rounded/SF-Pro-Rounded-Ultralight.otf"),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setFontsLoaded(true);
        SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setInitialRoute("Dashboard");
      } else {
        setInitialRoute("Login");
      }
    });

    return unsubscribe;
  }, []);

  if (!fontsLoaded) {
    return null;
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

export default App;
