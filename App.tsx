import React, { useState, useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import "./firebase";
import { auth } from "./firebase";
import { UserProvider } from "./UserContext";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import Forgot from "./screens/Forgot";
import Dashboard from "./screens/Dashboard";
import Workouts from "./screens/Workouts";
import ScanEquipment from "./screens/ScanEquipment";
import EquipmentResult from "./screens/EquipmentResult";
import WorkoutSchedule from "./screens/WorkoutSchedule";
import Meals from "./screens/Meals";
import ScanIngredients from "./screens/ScanIngredients";
import MacroChecker from "./screens/MacroChecker";
import Preferences from "./screens/Preferences";
import Profile from "./screens/Profile";
import Settings from "./screens/Settings";

const AuthStack = createStackNavigator();
const MainAppTabs = createBottomTabNavigator();
const RootStack = createStackNavigator();

SplashScreen.preventAutoHideAsync().catch(console.warn);

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="Signup" component={Signup} />
      <AuthStack.Screen name="Forgot" component={Forgot} />
    </AuthStack.Navigator>
  );
}

interface User {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}

interface MainAppTabNavigatorProps {
  initialRouteName: string;
}

function MainAppTabNavigator({ initialRouteName }: MainAppTabNavigatorProps) {
  return (
    <MainAppTabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
      initialRouteName={initialRouteName}
    >
      <MainAppTabs.Screen name="Preferences" component={Preferences} />
      <MainAppTabs.Screen name="Dashboard" component={Dashboard} />
      <MainAppTabs.Screen name="Workout" component={Workouts} />
      <MainAppTabs.Screen name="ScanEquipment" component={ScanEquipment} />
      <MainAppTabs.Screen name="EquipmentResult" component={EquipmentResult} />
      <MainAppTabs.Screen name="WorkoutSchedule" component={WorkoutSchedule} />
      <MainAppTabs.Screen name="Meal" component={Meals} />
      <MainAppTabs.Screen name="ScanIngredients" component={ScanIngredients} />
      <MainAppTabs.Screen name="MacroChecker" component={MacroChecker} />
      <MainAppTabs.Screen name="Profile" component={Profile} />
      <MainAppTabs.Screen name="Settings" component={Settings} />
    </MainAppTabs.Navigator>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initialRoute, setInitialRoute] = useState("Dashboard");
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
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
    const unsubscribe = auth.onAuthStateChanged((currentUser: User | null) => {
      setUser(currentUser);
      if (currentUser) {
        setInitialRoute("Dashboard"); // Or your logic to set the initial route
      }
    });

    return unsubscribe; // Cleanup subscription
  }, []);

  if (!fontsLoaded) {
    return null; // Or a minimal loading screen if you prefer
  }

  return (
    <UserProvider>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <RootStack.Screen
              name="MainApp"
              children={() => (
                <MainAppTabNavigator initialRouteName={initialRoute} />
              )}
            />
          ) : (
            <RootStack.Screen name="Auth" component={AuthStackNavigator} />
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}

export default App;
