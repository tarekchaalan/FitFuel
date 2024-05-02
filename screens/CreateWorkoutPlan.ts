import { firestore } from "../firebase";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  writeBatch,
} from "firebase/firestore";

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
  await deleteExistingWorkouts(userId); // Ensure previous workouts are cleared

  const weeklySchedule = distributeWorkoutDays(
    preferences.workoutFrequencyPerWeek,
    muscleGroups
  );

  for (const [day, muscleGroup] of Object.entries(weeklySchedule)) {
    if (muscleGroup) {
      const exercises = await fetchExercises(
        muscleGroup,
        preferences.fitnessLevel,
        preferences.workoutDuration
      );
      if (exercises.length > 0) {
        await saveWorkoutDetails(exercises, userId, day);
      } else {
        console.log(`No workouts found for ${day}`);
        await saveWorkoutDetails([], userId, day); // Save empty details if no workouts found
      }
    } else {
      console.log(`Workout for ${day}: Rest Day`);
      await saveRestDay(userId, day); // Save a rest day explicitly
    }
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
  fitnessLevel: string,
  maxDuration: number // Maximum total duration in minutes
): Promise<WorkoutDetail[]> {
  let exercises: WorkoutDetail[] = [];
  let totalTime = 0;
  const averageWorkoutTime = 5; // Average duration per workout in minutes

  for (const muscle of muscles) {
    if (totalTime >= maxDuration) break; // Stop if the planned workout duration is reached

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
    for (const workout of data) {
      if (totalTime + averageWorkoutTime <= maxDuration) {
        exercises.push(workout);
        totalTime += averageWorkoutTime;
      } else {
        break; // Do not add more workouts if it exceeds the time limit
      }
    }
  }

  return exercises;
}

async function saveWorkoutDetails(
  workoutDetails: WorkoutDetail[],
  userId: string,
  day: string
) {
  const dayRef = doc(firestore, "workoutDetails", userId, "days", day);
  const formattedWorkouts = workoutDetails.map((workout) => ({
    ...workout,
  }));

  try {
    await setDoc(dayRef, { workouts: formattedWorkouts, restDay: false }); // Explicitly mark as not a rest day
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
  const dayRef = doc(firestore, "workoutDetails", userId, "days", day);
  try {
    await setDoc(dayRef, { workouts: [], restDay: true }); // Clear workouts and mark as a rest day
    console.log(`Successfully saved Rest Day for ${day} for ${userId}`);
  } catch (error) {
    console.error(
      `Error saving Rest Day for ${day} for ${userId}:`,
      JSON.stringify(error, null, 2)
    );
  }
}

async function deleteExistingWorkouts(userId: string) {
  const daysRef = collection(firestore, "workoutDetails", userId, "days");
  const snapshot = await getDocs(daysRef);

  // Batch deletion to handle all documents at once
  const batch = writeBatch(firestore);
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  try {
    await batch.commit();
    console.log(`Successfully deleted existing workouts for user ${userId}`);
  } catch (error) {
    console.error(
      `Error deleting existing workouts for user ${userId}:`,
      error
    );
  }
}
