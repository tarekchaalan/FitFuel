import { firestore } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

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
    const exercises = await fetchExercises(
      muscleGroup,
      preferences.fitnessLevel
    );
    if (exercises.length > 0) {
      await saveWorkoutDetails(exercises, userId, day);
      console.log(`Workouts for ${day}:`, exercises);
    } else {
      console.log(`Workout for ${day}: rest`);
    }
  }
}

function distributeWorkoutDays(
  frequency: number,
  muscleGroups: Record<string, string[]>
): Record<string, string[]> {
  const week = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const workoutDays = week.slice(0, frequency);
  const schedule: Record<string, string[]> = {};
  const groupKeys = Object.keys(muscleGroups);

  workoutDays.forEach((day, i) => {
    schedule[day] = muscleGroups[groupKeys[i % groupKeys.length]];
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
      console.error(`HTTP error! status: ${response.status}`);
      continue;
    }

    const data = await response.json();
    exercises = exercises.concat(data); // Combine exercises from different muscles
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
    console.log(`Successfully saved workouts for ${day} for ${userId}`);
  } catch (error) {
    console.error(`Error saving workouts for ${day} for ${userId}:`, error);
  }
}
