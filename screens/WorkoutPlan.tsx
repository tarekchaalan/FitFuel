import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { firestore } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { BackIcon } from "../svgs";

const auth = getAuth();

interface Workout {
  name: string;
  muscle: string;
  sets: { reps: number; timePerRep: number }[];
  type: string;
  difficulty: string;
  equipment: string;
  instructions: string;
}

type WorkoutData = { [muscle: string]: Workout[] } | "Rest Day";

const WorkoutPlan = ({ navigation }: { navigation: any }) => {
  const [workouts, setWorkouts] = useState<WorkoutData | null>(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      console.log("UserId is undefined, skipping fetch");
      return;
    }

    const today = new Date().toLocaleDateString("en-us", { weekday: "long" });
    const dayRef = doc(firestore, "workoutDetails", user.uid, "days", today);

    const fetchDaySchedule = async () => {
      const docSnap = await getDoc(dayRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as {
          workouts: Workout[];
          restDay: boolean;
        };
        if (data.restDay) {
          setWorkouts("Rest Day");
        } else {
          // Convert array of workouts to the expected dictionary format
          const workoutDict = data.workouts.reduce<{
            [muscle: string]: Workout[];
          }>((acc, workout) => {
            acc[workout.muscle] = acc[workout.muscle] || [];
            acc[workout.muscle].push(workout);
            return acc;
          }, {});
          setWorkouts(workoutDict);
        }
      } else {
        setWorkouts("Rest Day");
      }
    };

    fetchDaySchedule();
  }, [user]);

  const handleWorkoutSelect = (workout: Workout) => {
    navigation.navigate("WorkoutDetails", workout);
  };

  if (typeof workouts === "string") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.BackContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackIcon />
          </TouchableOpacity>
        </View>
        <Text style={styles.header}>Workout Schedule</Text>
        <View style={styles.contentBox}>
          <Text style={styles.subHeader}>
            {new Date().toLocaleDateString("en-us", { weekday: "long" })}
          </Text>
          <Text style={styles.restDayMessage}>You can rest today!</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!workouts) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.loading}>Loading workouts...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <BackIcon />
      </TouchableOpacity>
      <Text style={styles.header}>Workout Schedule</Text>
      <Text style={styles.dayHeader}>
        {new Date().toLocaleDateString("en-us", { weekday: "long" })}
      </Text>
      <ScrollView style={styles.scrollView}>
        {Object.entries(workouts).map(([muscle, muscleWorkouts]) => (
          <View key={muscle} style={styles.workoutBox}>
            <Text style={styles.muscleHeader}>
              {muscle}
              {"  "}
              <Text style={styles.lightText}>
                (Please take a 2 minute break after each set)
              </Text>
            </Text>
            {/* Line here */}
            <View style={styles.line} />
            {muscleWorkouts.map((workout, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleWorkoutSelect(workout)}
              >
                <View style={styles.workoutContainer}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.repetitions}>( 3 x 15 )</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <Text style={styles.lightText}>Click on a workout to see details</Text>
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
  header: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: "5%",
    textTransform: "capitalize", // This will capitalize all letters
  },
  dayHeader: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    textTransform: "capitalize", // This will capitalize the first letter of each word
  },
  loading: {
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    justifyContent: "center",
    marginTop: "90%",
  },
  lightText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "SFProRounded-Ultralight",
  },
  scrollView: {
    margin: 20,
  },
  workoutBox: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    shadowColor: "#fff",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  muscleHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
    textTransform: "capitalize", // This will capitalize the first letter of each word
  },
  line: {
    backgroundColor: "#fff",
    height: 1,
    width: "100%",
    opacity: 0.2,
    marginBottom: 10,
  },
  workoutText: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
  },
  workoutContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  workoutName: {
    flex: 1, // Takes as much space as available
    textAlign: "left",
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
  },
  repetitions: {
    textAlign: "right",
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
  },

  contentBox: {
    padding: 20,
    alignItems: "center",
  },
  subHeader: {
    fontSize: 20,
    color: "#fff",
    textTransform: "capitalize", // Capitalize each word
  },
  restDayMessage: {
    fontSize: 16,
    color: "#fff",
    marginTop: 10,
    textTransform: "capitalize", // Capitalize each word
  },
});

export default WorkoutPlan;
