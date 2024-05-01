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
import { doc, getDoc, DocumentData } from "firebase/firestore";
import { BackIcon } from "../svgs";
import { NavigationProp } from "@react-navigation/native";

interface Props {
  navigation: NavigationProp<any>; // Assuming 'any' is replaced appropriately based on your navigation structure
  route: any;
}

const WorkoutPlan: React.FC<Props> = ({ navigation, route }) => {
  const [daySchedule, setDaySchedule] = useState<DocumentData | null | string>(
    null
  );

  useEffect(() => {
    const today = new Date().toLocaleDateString("en-us", { weekday: "long" });
    const dayRef = doc(firestore, "workouts", today);

    const fetchSchedule = async () => {
      const docSnap = await getDoc(dayRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (Array.isArray(data.workouts)) {
          // Assuming 'workouts' is the array field
          setDaySchedule(data.workouts);
        } else {
          setDaySchedule("Rest Day");
        }
      } else {
        setDaySchedule("Rest Day");
      }
    };

    fetchSchedule().catch(console.error);
  }, []);

  const navigateToDetails = (workout: DocumentData) => {
    navigation.navigate("WorkoutDetails", { ...workout });
  };

  const groupExercisesByMuscle = (workouts: DocumentData[]) => {
    const grouped: { [key: string]: DocumentData[] } = {};
    workouts.forEach((workout) => {
      const muscleGroup = workout.muscle as string;
      if (!grouped[muscleGroup]) {
        grouped[muscleGroup] = [];
      }
      grouped[muscleGroup].push(workout);
    });
    return grouped;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.BackContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
      </View>
      <Text style={styles.pageHeader}>Workout Schedule</Text>
      <ScrollView style={styles.scrollView}>
        {typeof daySchedule === "string" ? (
          <View style={styles.restDayBox}>
            <Text style={styles.restDayText}>{daySchedule}</Text>
          </View>
        ) : (
          daySchedule &&
          Object.entries(
            groupExercisesByMuscle(daySchedule as DocumentData[])
          ).map(([muscle, workouts]) => (
            <View key={muscle} style={styles.workoutBox}>
              <Text style={styles.muscleHeader}>{muscle}</Text>
              {workouts.map((workout, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigateToDetails(workout)}
                >
                  <Text style={styles.workoutText}>
                    {workout.name} | {workout.sets.length} x{" "}
                    {workout.sets[0].reps} reps
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
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
    fontSize: 20,
    fontFamily: "SFProRounded-Heavy",
    color: "#fff",
    alignSelf: "center",
  },
  scrollView: {
    marginHorizontal: 20,
  },
  restDayBox: {
    alignItems: "center",
    marginVertical: 20,
  },
  restDayText: {
    fontSize: 18,
    color: "#fff",
  },
  workoutBox: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
  },
  muscleHeader: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 5,
  },
  workoutText: {
    fontSize: 14,
    color: "#fff",
  },
});

export default WorkoutPlan;
