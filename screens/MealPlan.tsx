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
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { BackIcon } from "../svgs";
import { getAuth } from "firebase/auth";
import { createMealPlan } from "./CreateMealPlan";
import { UserPreferences } from "./Preferences";

const auth = getAuth();

interface MealData {
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
  const [selectedMeal, setSelectedMeal] = useState<MealData | null>(null);
  const [mealData, setMealData] = useState<MealDataMap>({
    breakfast: {},
    lunch: {},
    dinner: {},
  });

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      console.log("UserId is undefined, skipping fetch");
      return;
    }

    const userDocRef = doc(firestore, "mealDetails", user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (doc) => {
        if (doc.exists()) {
          console.log(
            "Real-time update to meal data:",
            JSON.stringify(doc.data(), null, 2)
          );
          const userData = doc.data();
          setMealData({
            breakfast: userData.breakfast || {},
            lunch: userData.lunch || {},
            dinner: userData.dinner || {},
          });
        } else {
          console.log("No such document!");
        }
      },
      (error) => {
        console.error("Error fetching meals:", error);
      }
    );

    return () => unsubscribe(); // Cleanup function to unsubscribe from the listener
  }, [user]); // Dependency on the user object

  const regenerateMeals = async () => {
    if (user) {
      try {
        const userDocRef = doc(firestore, "preferences", user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userPreferences = docSnap.data() as UserPreferences; // Cast userPreferences to UserPreferences
          console.log(
            "User preferences fetched for regeneration:",
            userPreferences
          );
          await createMealPlan(userPreferences, user.uid);
          Alert.alert("Meals Regenerated", "Your meal plan has been updated.");
        } else {
          console.error("No preferences found for the user.");
          Alert.alert(
            "Error",
            "No preferences found. Please set your preferences first."
          );
        }
      } catch (error) {
        console.error("Error regenerating meals:", error);
        Alert.alert("Error", "Failed to regenerate meals.");
      }
    } else {
      Alert.alert("Error", "No authenticated user found.");
    }
  };

  return (
    <View style={styles.container}>
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
              {mealType === "breakfast" && (
                <Text style={styles.entryheader}>Breakfast</Text>
              )}
              {mealType === "lunch" && (
                <Text style={styles.entryheader}>Lunch</Text>
              )}
              {mealType === "dinner" && (
                <Text style={styles.entryheader}>Dinner</Text>
              )}
              {meal.title && (
                <TouchableOpacity
                  key={mealType}
                  style={styles.mealItem}
                  onPress={() => setSelectedMeal(meal)}
                >
                  <Image
                    source={{ uri: meal.image }}
                    style={styles.mealImage}
                  />
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
        {selectedMeal && (
          <View style={styles.mealDetail}>
            <View style={styles.detailBackContainer}>
              <TouchableOpacity onPress={() => setSelectedMeal(null)}>
                <BackIcon />
              </TouchableOpacity>
            </View>
            <Text style={styles.title}>{selectedMeal.title}</Text>
            <ScrollView>
              <Image
                source={{ uri: selectedMeal.image }}
                style={styles.detailImage}
              />
              <Text style={styles.SectionTitle}>Summary</Text>
              <Text style={styles.sectionBody}>{selectedMeal.summary}</Text>
              <Text style={styles.SectionTitle}>Time to make</Text>
              <Text style={styles.sectionBody}>
                {selectedMeal.readyInMinutes} minutes
              </Text>
              <Text style={styles.SectionTitle}>Servings</Text>
              <Text style={styles.sectionBody}>
                {selectedMeal.servings} servings
              </Text>

              <Text style={styles.detailHeader}>Nutrients</Text>
              {selectedMeal.nutrients && selectedMeal.nutrients.length > 0 ? (
                selectedMeal.nutrients.map((nutrient, index) => (
                  <Text key={index} style={styles.nutrientItem}>
                    {`${nutrient.title}: ${nutrient.amount} ${nutrient.unit}`}
                  </Text>
                ))
              ) : (
                <Text style={styles.nutrientItem}>
                  No Nutrient Data Available
                </Text>
              )}

              <Text style={styles.detailHeader}>Instructions</Text>
              {selectedMeal.instructions &&
              selectedMeal.instructions.length > 0 ? (
                selectedMeal.instructions.map((instruction, index) => (
                  <Text key={index} style={styles.instructionItem}>
                    {`${instruction.number}. ${instruction.step}`}
                  </Text>
                ))
              ) : (
                <Text style={styles.instructionItem}>
                  No Instructions Available
                </Text>
              )}
            </ScrollView>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
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
    alignItems: "center", // This ensures vertical centering
    height: 150, // Adjust the height as needed
    marginBottom: 10,
    borderBottomColor: "#aaa",
    borderWidth: 1,
    paddingLeft: 10,
  },
  mealTextContainer: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center", // Centers text vertically within the container
  },
  mealImage: {
    width: 125,
    height: 125,
    borderRadius: 10,
    marginRight: 10,
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
  mealDetail: {
    padding: 20,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    zIndex: 1,
  },
  detailBackContainer: {
    alignItems: "flex-start",
    marginLeft: "2%",
    marginTop: "10%",
  },
  title: {
    fontSize: 22,
    fontFamily: "SFProRounded-Heavy",
    color: "#fff",
    alignSelf: "center",
    textAlign: "center",
    marginBottom: 10,
  },
  detailImage: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    marginBottom: 10,
  },
  SectionTitle: {
    fontSize: 18,
    fontFamily: "SFProRounded-Heavy",
    color: "#fff",
    marginTop: 25,
  },
  sectionBody: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "SFProRounded-Light",
    marginBottom: 10,
    marginTop: 10,
  },
  detailHeader: {
    fontSize: 20,
    fontFamily: "SFProRounded-Heavy",
    marginTop: 25,
    color: "#fff",
  },
  nutrientItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    color: "#fff",
  },
  instructionItem: {
    color: "#fff",
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 20,
  },
});

export default MealPlan;
