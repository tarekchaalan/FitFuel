// Tarek Chaalan
// Project Completed: May 3, 2024

import axios from "axios";
import { Alert } from "react-native";
import { firestore } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

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

interface MealDetail {
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  summary: string;
  nutrients: Array<{
    title: string;
    amount: number;
    unit: string;
  }>;
  instructions: Array<{
    number: number;
    step: string;
    ingredients: Array<{
      id: number;
      name: string;
      localizedName: string;
      image: string;
    }>;
    equipment: Array<{
      id: number;
      name: string;
      localizedName: string;
      image: string;
    }>;
  }>;
}

interface ApiResponse {
  results: MealDetail[];
  nutrition: {
    nutrients: Array<{
      title: string;
      amount: number;
      unit: string;
    }>;
  };
  analyzedInstructions: Array<{
    steps: Array<{
      number: number;
      step: string;
    }>;
  }>;
}

const API_KEY = "e239de4240mshb093dfb4f333ef4p13eaafjsn7207ea6e4c74";
const API_HOST = "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com";
const API_URL = `https://${API_HOST}/recipes/complexSearch`;

const breakfastListQuery = [
  "oatmeal",
  "smoothie",
  "eggs",
  "yogurt parfait",
  "pancakes",
  "avocado toast",
];
const lunchListQuery = ["salad", "sandwich", "soup", "wrap", "burger", "sushi"];
const dinnerListQuery = [
  "chicken",
  "pasta",
  "steak",
  "seafood",
  "taco",
  "stir fry",
  "pizza",
];

function randomQuery(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)];
}

// Calculate daily caloric needs based on user's physical and lifestyle data
function calculateCaloricNeeds(preferences: UserPreferences): number {
  const { currentWeight, height, age, gender, activityLevel } = preferences;
  // Works out BMR
  let bmr =
    10 * currentWeight +
    6.25 * height -
    5 * age +
    (gender === "Male" ? 5 : -161);
  // Adjust BMR based on activity level and target weight
  const activityMultipliers = {
    Sedentary: 1.2,
    Light: 1.375,
    Moderate: 1.55,
    Vigorous: 1.725,
  };
  // Caloric Deficit or Surplus based on target weight
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
  const query =
    mealType === "breakfast"
      ? randomQuery(breakfastListQuery)
      : mealType === "lunch"
      ? randomQuery(lunchListQuery)
      : randomQuery(dinnerListQuery);
  const calories = calculateCaloricNeeds(preferences);
  return {
    query,
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
        const mealDetails = response.data.results[0];
        await saveMealDetails(mealDetails, userId, type);

        // console.log(`Meals for ${type}:`, response.data.results);

        if (mealDetails.nutrition) {
          const nutrients = mealDetails.nutrition.nutrients;
          // console.log("Nutrients:", JSON.stringify(nutrients, null, 2)); // The `null, 2` arguments format the output for readability
        }

        if (mealDetails.analyzedInstructions.length > 0) {
          const instructions = mealDetails.analyzedInstructions[0].steps;
          // console.log(
          //   "Cooking Instructions:",
          //   JSON.stringify(instructions, null, 2)
          // );
        }
      } else {
        Alert.alert(`No meals found for ${type}, please try again.`);
      }
    } catch (error) {
      // console.error(`Failed to fetch meals for ${type}`, error);
    }
  }
}

// Save meal details to Firestore
async function saveMealDetails(mealDetails: any, userId: any, mealType: any) {
  // console.log("Saving meal details", { mealDetails, userId, mealType });
  const mealsRef = doc(firestore, "mealDetails", userId);

  // Safely extracting nutrients with logging
  const formattedNutrients =
    mealDetails.nutrition?.nutrients.map((nutrient: any) => ({
      title: nutrient.name,
      amount: nutrient.amount,
      unit: nutrient.unit,
    })) || [];
  // console.log("Formatted nutrients:", formattedNutrients);

  // Safely extracting instructions with checks and logging
  const formattedInstructions =
    mealDetails.analyzedInstructions[0]?.steps.map((step: any) => {
      const formattedIngredients =
        step.ingredients?.map((ingredient: any) => ({
          id: ingredient.id,
          name: ingredient.name,
          image: ingredient.image,
        })) || [];

      const formattedEquipment =
        step.equipment?.map((equipment: any) => ({
          id: equipment.id,
          name: equipment.name,
          image: equipment.image,
        })) || [];

      return {
        number: step.number,
        step: step.step,
        ingredients: formattedIngredients,
        equipment: formattedEquipment,
      };
    }) || [];
  // console.log("Formatted instructions:", formattedInstructions);

  // Build the meal data object
  const mealData = {
    title: mealDetails.title,
    image: mealDetails.image,
    readyInMinutes: mealDetails.readyInMinutes,
    servings: mealDetails.servings,
    summary: mealDetails.summary.replace(/<[^>]*>/g, ""),
    nutrients: formattedNutrients,
    instructions: formattedInstructions,
  };

  // Try saving to Firestore with error handling
  try {
    await setDoc(mealsRef, { [mealType]: mealData }, { merge: true });
    // console.log(`Successfully saved ${mealType} details for ${userId}`);
  } catch (error) {
    // console.error(`Error saving ${mealType} details for ${userId}:`, error);
  }
}
