// Tarek Chaalan
// Project Completed: May 3, 2024

import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { firestore } from "../firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { createMealPlan } from "./CreateMealPlan";
import { UserPreferences } from "./Preferences";
import { BackIcon } from "../svgs";
import { getAuth } from "firebase/auth";

const auth = getAuth();

export interface MealData {
  title?: string;
  image?: string;
  summary?: string;
  readyInMinutes?: number;
  servings?: number;
  nutrients?: Array<{
    title: string;
    amount: number;
    unit: string;
  }>;
  instructions?: Array<{
    number: number;
    step: string;
  }>;
}

interface MealDataMap {
  breakfast: MealData;
  lunch: MealData;
  dinner: MealData;
}

const MealPlan = ({ navigation }: { navigation: any }) => {
  const [mealData, setMealData] = useState<MealDataMap>({
    breakfast: {},
    lunch: {},
    dinner: {},
  });

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      // console.log("UserId is undefined, skipping fetch");
      return;
    }

    const userDocRef = doc(firestore, "mealDetails", user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (doc) => {
        if (doc.exists()) {
          // console.log(
          //   "Real-time update to meal data:",
          //   JSON.stringify(doc.data(), null, 2)
          // );
          const userData = doc.data();
          setMealData({
            breakfast: userData.breakfast || {},
            lunch: userData.lunch || {},
            dinner: userData.dinner || {},
          });
        } else {
          // console.log("No such document!");
        }
      },
      (error) => {
        // console.error("Error fetching meals:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const regenerateMeals = async () => {
    if (user) {
      try {
        const userDocRef = doc(firestore, "preferences", user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userPreferences = docSnap.data() as UserPreferences; // Cast userPreferences to UserPreferences
          // console.log(
          //   "User preferences fetched for regeneration:",
          //   userPreferences
          // );
          await createMealPlan(userPreferences, user.uid);
          Alert.alert("Meals Regenerated", "Your meal plan has been updated.");
        } else {
          // console.error("No preferences found for the user.");
          Alert.alert(
            "Error",
            "No preferences found. Please set your preferences first."
          );
        }
      } catch (error) {
        // console.error("Error regenerating meals:", error);
        Alert.alert("Error", "Failed to regenerate meals.");
      }
    } else {
      Alert.alert("Error", "No authenticated user found.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.BackContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
      </View>
      <Text style={styles.pageHeader}>Your Meal Plan</Text>
      <ScrollView style={styles.mealList}>
        {Object.entries(mealData).map(([mealType, meal]) => (
          <React.Fragment key={mealType}>
            <Text style={styles.entryheader}>
              {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </Text>
            {meal.title && (
              <TouchableOpacity
                style={styles.mealItem}
                onPress={() => navigation.navigate("MealDetails", { meal })}
              >
                <Image source={{ uri: meal.image }} style={styles.mealImage} />
                <View style={styles.mealTextContainer}>
                  <Text
                    numberOfLines={3}
                    ellipsizeMode="tail"
                    style={styles.mealTitle}
                  >
                    {meal.title}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </React.Fragment>
        ))}
        <Text style={styles.regenMeals}>
          Not Satisfied?{"  "}
          <Text style={styles.regenMealsButton} onPress={regenerateMeals}>
            Regenerate Meals
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  BackContainer: {
    alignItems: "flex-start",
    marginLeft: "5%",
    marginTop: "2%",
  },
  pageHeader: {
    fontSize: 36,
    fontFamily: "SFProRounded-Heavy",
    color: "#fff",
    alignSelf: "center",
  },
  entryheader: {
    fontSize: 26,
    fontFamily: "SFProText-Heavy",
    color: "#fff",
    marginTop: 10,
    marginLeft: 13,
  },
  mealList: {
    padding: 10,
  },
  mealItem: {
    flexDirection: "row",
    alignItems: "center",
    height: 150,
    marginBottom: 10,
    paddingLeft: 10,
  },
  mealImage: {
    width: 125,
    height: 125,
    borderRadius: 10,
    marginRight: 10,
  },
  mealTextContainer: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },
  mealTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "SFProRounded-Regular",
    textAlign: "center",
  },
  regenMeals: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "SFProRounded-Regular",
    textAlign: "center",
    marginTop: 20,
  },
  regenMealsButton: {
    color: "#9A2CE8",
    fontSize: 18,
    fontFamily: "SFProRounded-Regular",
    textDecorationLine: "underline",
  },
});

export default MealPlan;
