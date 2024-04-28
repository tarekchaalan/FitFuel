import axios from "axios";
import { firestore } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface UserPreferences {
  query: string;
  dietaryRestrictions: string[];
  intolerances: string[];
  dislikedFoods: string[];
  foodAllergies: string[];
  activityLevel: "Sedentary" | "Light" | "Moderate" | "Vigorous";
  currentWeight: number;
  targetWeight: number;
  currentPhysique: "Lean" | "Balanced" | "Fuller";
  targetPhysique: "Lean" | "Balanced" | "Muscular";
  age: number;
  height: number; // Assume height in inches
  gender: "Male" | "Female" | "Other";
}

const API_KEY = "e239de4240mshb093dfb4f333ef4p13eaafjsn7207ea6e4c74";
const API_HOST = "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com";
const API_URL = `https://${API_HOST}/recipes/complexSearch`;

// Calculate daily caloric needs based on user's physical and lifestyle data
function calculateCaloricNeeds(preferences: UserPreferences): number {
  const { currentWeight, height, age, gender, activityLevel } = preferences;
  let bmr =
    10 * currentWeight +
    6.25 * height -
    5 * age +
    (gender === "Male" ? 5 : -161);
  const activityMultipliers = {
    Sedentary: 1.2,
    Light: 1.375,
    Moderate: 1.55,
    Vigorous: 1.725,
  };
  return (
    bmr * (activityMultipliers[activityLevel] || 1.2) +
    (currentWeight > preferences.targetWeight ? -500 : 500)
  );
}

// Build API request parameters based on user preferences
async function buildParams(
  preferences: UserPreferences,
  mealType: string,
  userId: string
): Promise<any> {
  const query = await fetchAndUpdateQuery(userId);
  const calories = calculateCaloricNeeds(preferences);
  return {
    query: query || "",
    diet: preferences.dietaryRestrictions.join(","),
    intolerances: preferences.intolerances.join(","),
    excludeIngredients: [
      ...preferences.dislikedFoods,
      ...preferences.foodAllergies,
    ].join(","),
    type: mealType,
    instructionsRequired: true,
    addRecipeInformation: true,
    maxReadyTime: 60,
    ignorePantry: false,
    sort: "calories",
    sortDirection: "asc",
    number: 1,
    minCalories: Math.round(calories * 0.9),
    maxCalories: Math.round(calories * 1.1),
    minProtein: Math.round((calories * 0.15) / 4),
    maxProtein: Math.round((calories * 0.25) / 4),
    minFat: Math.round((calories * 0.2) / 9),
    maxFat: Math.round((calories * 0.3) / 9),
    minCarbs: Math.round((calories * 0.45) / 4),
    maxCarbs: Math.round((calories * 0.55) / 4),
  };
}

// Fetch and update the query based on user's preferred foods
async function fetchAndUpdateQuery(userId: string): Promise<string> {
  const userRef = doc(firestore, "preferences", userId);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    const userData = docSnap.data();
    const preferredFoods = userData.preferredFoods || [];
    const randomQuery =
      preferredFoods[Math.floor(Math.random() * preferredFoods.length)];
    await setDoc(userRef, { query: randomQuery }, { merge: true });
    return randomQuery;
  }
  return "";
}

// Fetch meals from API and save to Firestore
export async function createMealPlan(
  preferences: UserPreferences,
  userId: string
): Promise<void> {
  const mealTypes = ["breakfast", "lunch", "dinner"];

  for (const type of mealTypes) {
    const params = await buildParams(preferences, type, userId);
    try {
      const response = await axios.get(API_URL, {
        params,
        headers: { "X-RapidAPI-Key": API_KEY, "X-RapidAPI-Host": API_HOST },
      });
      if (response.data.results.length > 0) {
        // Assume first result is the most relevant
        const mealDetails = response.data.results[0];
        await saveMealDetails(mealDetails, userId, type);
      }
      console.log(`Meals for ${type}:`, response.data.results);
    } catch (error) {
      console.error(`Failed to fetch meals for ${type}`, error);
    }
  }
}

// Save meal details to Firestore
async function saveMealDetails(
  mealDetails: any,
  userId: string,
  mealType: string
): Promise<void> {
  const mealsRef = doc(firestore, "mealDetails", userId);
  const mealData = {
    title: mealDetails.title,
    image: mealDetails.image,
    readyInMinutes: mealDetails.readyInMinutes,
    servings: mealDetails.servings,
    summary: mealDetails.summary.replace(/<[^>]+>/g, ""), // Strip HTML tags from summary
  };

  const mealTypeData = { [mealType]: mealData };
  await setDoc(mealsRef, mealTypeData, { merge: true });
}
