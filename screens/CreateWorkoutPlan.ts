// Error: muscleImage is an empty string in firebase

import { firestore } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import axios from "axios";

interface UserPreferences {
  fitnessLevel: string;
  typesOfWorkouts: string[];
  workoutDuration: number;
  workoutFrequencyPerWeek: number;
}

interface WorkoutDetail {
  id: number;
  name: string;
  type: string;
  muscle: string;
  difficulty: string;
  muscleImage?: string;
}

const API_KEY = "b1rEEJVCNE42lsxFixyYDQ==dn1SX7muKjer2xZg";
const API_URL = "https://api.api-ninjas.com/v1/exercises";

// Muscle groups
const muscleGroups = {
  "Upper Body Push": ["chest", "triceps", "shoulders"],
  "Upper Body Pull": ["back", "biceps", "forearms"],
  "Legs & Core": ["quadriceps", "hamstrings", "calves", "abdominals", "glutes"],
};

export async function createWorkoutPlan(
  preferences: UserPreferences,
  userId: string
): Promise<void> {
  const weeklySchedule = distributeWorkoutDays(
    preferences.workoutFrequencyPerWeek,
    muscleGroups
  );

  for (const [day, muscleGroup] of Object.entries(weeklySchedule)) {
    if (muscleGroup) {
      const exercises = await fetchExercises(
        muscleGroup,
        preferences.fitnessLevel
      );
      if (exercises.length > 0) {
        await saveWorkoutDetails(exercises, userId, day);
      } else {
        console.log(`No workouts found for ${day}`);
        // Save empty workout details to signify no planned exercises
        await saveWorkoutDetails([], userId, day);
      }
    } else {
      console.log(`Workout for ${day}: Rest Day`);
      // Explicitly save a rest day in the database
      await saveRestDay(userId, day);
    }
  }
}

async function getMuscleImage(muscle: string): Promise<string> {
  const options = {
    method: "GET",
    url: "https://muscle-group-image-generator.p.rapidapi.com/getImage",
    params: {
      muscleGroups: muscle,
      color: "154,44,232",
      transparentBackground: "1",
    },
    headers: {
      "X-RapidAPI-Key": "e239de4240mshb093dfb4f333ef4p13eaafjsn7207ea6e4c74",
      "X-RapidAPI-Host": "muscle-group-image-generator.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    if (response.data && response.data.image_url) {
      return response.data.image_url; // Assuming the API returns the image URL
    } else {
      throw new Error("Invalid response from muscle image API");
    }
  } catch (error) {
    console.error("Error fetching muscle image:", error);
    throw error;
  }
}

function distributeWorkoutDays(
  frequency: number,
  muscleGroups: Record<string, string[]>
): Record<string, string[] | null> {
  const week = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  let schedule: Record<string, string[] | null> = {};

  // Randomly shuffle the days to start distribution from a random day
  let shuffledDays = week.sort(() => Math.random() - 0.5);
  let workoutIndices = new Set<number>();
  let increment = Math.floor(7 / frequency);

  // Determine workout days by spaced intervals
  for (let i = 0; i < frequency; i++) {
    let index = (i * increment) % 7;
    while (workoutIndices.has(index)) {
      // Ensure unique days if overlap occurs
      index = (index + 1) % 7;
    }
    workoutIndices.add(index);
  }

  // Assign muscle groups to the calculated workout days
  shuffledDays.forEach((day, index) => {
    if (workoutIndices.has(index)) {
      schedule[day] =
        muscleGroups[
          Object.keys(muscleGroups)[index % Object.keys(muscleGroups).length]
        ];
    } else {
      schedule[day] = null; // Assign rest days
    }
  });

  return schedule;
}

async function fetchExercises(
  muscles: string[],
  fitnessLevel: string
): Promise<WorkoutDetail[]> {
  let exercises: WorkoutDetail[] = [];
  for (const muscle of muscles) {
    const response = await fetch(
      `${API_URL}?muscle=${muscle}&difficulty=${fitnessLevel}`,
      {
        method: "GET",
        headers: {
          "X-Api-Key": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(
        "HTTP error!",
        JSON.stringify(await response.json(), null, 2)
      );
      continue;
    }

    const data = await response.json();
    exercises = exercises.concat(data); // Combine exercises from different muscles

    // Make a request to the muscle group image generation API
    try {
      const muscleImage = await getMuscleImage(muscle);
      exercises.forEach((exercise) => {
        exercise.muscleImage = muscleImage;
      });
    } catch (error) {
      console.error("Error fetching muscle image:", error);
    }
  }

  return exercises;
}

async function saveWorkoutDetails(
  workoutDetails: WorkoutDetail[],
  userId: string,
  day: string
) {
  const workoutsRef = doc(firestore, "workoutDetails", userId);
  const formattedWorkouts = workoutDetails.map((workout) => ({
    ...workout,
    sets: Array.from({ length: 3 }, (_) => ({
      reps: 15,
      timePerRep: 4, // seconds
      restAfterSet: 120, // seconds
    })),
  }));

  try {
    await setDoc(workoutsRef, { [day]: formattedWorkouts }, { merge: true });
    console.log(
      `Successfully saved workouts for ${day} for ${userId}:`,
      JSON.stringify(formattedWorkouts, null, 2)
    );
  } catch (error) {
    console.error(
      `Error saving workouts for ${day} for ${userId}:`,
      JSON.stringify(error, null, 2)
    );
  }
}

async function saveRestDay(userId: string, day: string) {
  const workoutsRef = doc(firestore, "workoutDetails", userId);
  try {
    await setDoc(workoutsRef, { [day]: "Rest Day" }, { merge: true });
    console.log(`Successfully saved Rest Day for ${day} for ${userId}`);
  } catch (error) {
    console.error(
      `Error saving Rest Day for ${day} for ${userId}:`,
      JSON.stringify(error, null, 2)
    );
  }
}
