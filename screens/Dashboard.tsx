import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ImageSourcePropType,
} from "react-native";
import { PreferencesIcon, WorkoutIcon, MealIcon, ProfileIcon } from "../svgs";
import Svg, { Path } from "react-native-svg";
import { useUser } from "../UserContext";
import { getAuth } from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  getFirestore,
  increment,
  onSnapshot,
} from "firebase/firestore";

const db = getFirestore();
const auth = getAuth();

interface WorkoutItemProps {
  title: string;
  muscles: string;
  imageSource: ImageSourcePropType;
  navigation: any;
}

interface Workout {
  muscle: string; // Add more fields as necessary
}

interface WorkoutDetail {
  title: string;
  muscles: string;
  imageSource: ImageSourcePropType;
}

interface WorkoutState {
  title: string;
  imageSource: ImageSourcePropType;
  details?: WorkoutDetail[];
}

const placeholderImge = require("../assets/images/placeholder.png");

const Dashboard = ({ navigation }: { navigation: any }) => {
  const { currentUser } = useUser();
  const [fullName, setFullName] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState(
    require("../assets/images/profile-placeholder.jpg")
  );
  const [monthlyChallengeHours, setMonthlyChallengeHours] = useState(0);
  const [totalWorkoutHours, setTotalWorkoutHours] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [meals, setMeals] = useState({
    breakfast: {
      title: "Loading...",
      image: require("../assets/images/placeholder.png"),
      summary: "",
      readyInMinutes: 0,
      servings: 0,
      nutrients: [],
      instructions: [],
    },
    lunch: {
      title: "Loading...",
      image: require("../assets/images/placeholder.png"),
      summary: "",
      readyInMinutes: 0,
      servings: 0,
      nutrients: [],
      instructions: [],
    },
    dinner: {
      title: "Loading...",
      image: require("../assets/images/placeholder.png"),
      summary: "",
      readyInMinutes: 0,
      servings: 0,
      nutrients: [],
      instructions: [],
    },
  });
  const [workouts, setWorkouts] = useState<WorkoutState>({
    title: "Loading...",
    imageSource: require("../assets/images/placeholder.png"),
  });

  useEffect(() => {
    if (!auth.currentUser) {
      console.log("No user logged in.");
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "mealDetails", auth.currentUser.uid),
      (doc) => {
        if (!doc.exists()) {
          console.log("No meal data found.");
          return;
        }

        const mealData = doc.data();
        setMeals({
          breakfast: {
            title: mealData.breakfast.title,
            image:
              mealData.breakfast.image ||
              require("../assets/images/placeholder.png"),
            summary: mealData.breakfast.summary,
            readyInMinutes: mealData.breakfast.readyInMinutes,
            servings: mealData.breakfast.servings,
            nutrients: mealData.breakfast.nutrients,
            instructions: mealData.breakfast.instructions,
          },
          lunch: {
            title: mealData.lunch.title,
            image:
              mealData.lunch.image ||
              require("../assets/images/placeholder.png"),
            summary: mealData.lunch.summary,
            readyInMinutes: mealData.lunch.readyInMinutes,
            servings: mealData.lunch.servings,
            nutrients: mealData.lunch.nutrients,
            instructions: mealData.lunch.instructions,
          },
          dinner: {
            title: mealData.dinner.title,
            image:
              mealData.dinner.image ||
              require("../assets/images/placeholder.png"),
            summary: mealData.dinner.summary,
            readyInMinutes: mealData.dinner.readyInMinutes,
            servings: mealData.dinner.servings,
            nutrients: mealData.dinner.nutrients,
            instructions: mealData.dinner.instructions,
          },
        });
      }
    );

    return () => unsubscribe(); // Cleanup function to unsubscribe when the component unmounts or dependencies change
  }, [auth.currentUser]); // Dependency on currentUser to re-invoke when it changes

  useEffect(() => {}, [meals]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!auth.currentUser) {
        console.log("No user logged in.");
        return;
      }

      const today = new Date().toLocaleDateString("en-us", { weekday: "long" });
      const dayRef = doc(
        db,
        "workoutDetails",
        auth.currentUser.uid,
        "days",
        today
      );

      const docSnap = await getDoc(dayRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.workouts && Array.isArray(data.workouts)) {
          // Explicitly state the type of each workout using the 'Workout' interface
          const workoutsData = data.workouts.map((workout: Workout) => ({
            title: today,
            muscles: workout.muscle,
            imageSource: placeholderImge,
          }));
          const muscleGroups = [
            ...new Set(workoutsData.map((workout) => workout.muscles)),
          ];
          // Map and join with proper types
          const muscles = muscleGroups
            .map((muscle) =>
              muscle
                .split(" ")
                .map(
                  (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join(" ")
            )
            .join(" | ");
          setWorkouts((prev) => ({
            ...prev,
            details: [
              {
                title: today,
                muscles: muscles,
                imageSource: placeholderImge,
              },
            ],
          }));
        } else {
          setWorkouts((prev) => ({
            ...prev,
            details: [
              {
                title: today,
                muscles: "Rest Day",
                imageSource: placeholderImge,
              },
            ],
          }));
        }
      } else {
        console.log("No workout data found for today.");
      }
    };

    fetchWorkouts();
  }, [auth.currentUser]);

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      // Initialize variables to hold data from Firestore
      let workoutDurationInHours = 0;
      let workoutFrequencyPerWeek = 0;
      let totalWorkouts = 0;

      // Fetch user preferences
      const preferencesRef = doc(db, "preferences", user.uid);
      try {
        const preferencesSnap = await getDoc(preferencesRef);
        if (preferencesSnap.exists()) {
          const preferencesData = preferencesSnap.data();
          // Assuming workoutDuration is in minutes, convert it to hours for the calculation
          workoutDurationInHours = (preferencesData.workoutDuration || 0) / 60;
          workoutFrequencyPerWeek =
            preferencesData.workoutFrequencyPerWeek || 0;
        } else {
          console.log("No preferences found.");
        }
      } catch (error) {
        console.error("Error fetching user preferences: ", error);
      }

      // Fetch user data
      const dataRef = doc(db, "data", user.uid);
      try {
        const dataSnap = await getDoc(dataRef);
        if (dataSnap.exists()) {
          const userData = dataSnap.data();
          totalWorkouts = userData.totalWorkouts || 0;

          // Calculate total workout hours and other metrics based on fetched preferences and data
          const totalWorkoutHours =
            Math.round(totalWorkouts * workoutDurationInHours * 100) / 100;
          const expectedHours =
            Math.round(
              workoutFrequencyPerWeek * workoutDurationInHours * 4 * 100
            ) / 100;
          const progress = (totalWorkoutHours / expectedHours) * 100;

          // Update state or handle the calculated data as needed
          setMonthlyChallengeHours(expectedHours);
          setTotalWorkoutHours(totalWorkoutHours);
          setProgressPercentage(progress);
        } else {
          console.log("No user data found.");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    }
  };

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.displayName || "Name not found");
      const pictureSource =
        currentUser.photoURL ||
        require("../assets/images/profile-placeholder.jpg");
      setProfilePicture(pictureSource);
      // console.log("Profile Picture URI:", pictureSource);
      fetchUserData();
    }
  }, [currentUser]);

  // Focus effect for re-fetching data when navigating back to the Dashboard
  useFocusEffect(
    useCallback(() => {
      // Ensure this function fetches and updates fullName and profilePicture as well
      fetchUserData();
    }, [setFullName, setProfilePicture]) // Add dependencies for update functions
  );

  const updateUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDataRef = doc(db, "data", user.uid);
      try {
        await setDoc(
          userDataRef,
          {
            totalWorkouts: increment(1), // Use Firestore increment to ensure correct concurrent updates
          },
          { merge: true }
        );

        // Optionally refetch user data if needed
        fetchUserData();
      } catch (error) {
        console.error("Error updating total workouts: ", error);
        alert("Failed to log workout. Please try again later.");
      }
    } else {
      alert("Please log in to log your workout.");
    }
  };

  const progressStatusText = () => {
    if (progressPercentage < 100) {
      return `You're ${progressPercentage.toFixed(
        2
      )}% closer to your monthly goal`;
    } else if (progressPercentage === 100) {
      return "You've hit your monthly goal! Congratulations!";
    } else {
      return `You're ${(progressPercentage - 100).toFixed(
        2
      )}% over your monthly goal! Keep it up!`;
    }
  };

  const glowEffect = progressPercentage >= 100 ? styles.glow : null;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.header}>
            <Image
              source={
                typeof profilePicture === "string"
                  ? { uri: profilePicture }
                  : profilePicture
              }
              style={styles.profileImage}
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerText}>Good morning,</Text>
              <Text style={styles.nameText}>{fullName}</Text>
            </View>
            <TouchableOpacity
              style={{ position: "absolute", top: "15%", right: "6%" }}
              onPress={() => navigation.navigate("Preferences")}
            >
              <PreferencesIcon />
            </TouchableOpacity>
          </View>
          <View style={styles.goalContainer}>
            <Text style={styles.goalBold}>
              Monthly Challenge:{"    "}
              <Text style={styles.goalLight}>
                Workout for {monthlyChallengeHours} hours
              </Text>
            </Text>
            <Text style={styles.goalPercentage}>{progressStatusText()}</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progress,
                  { width: `${progressPercentage}%` },
                  glowEffect,
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {totalWorkoutHours} / {monthlyChallengeHours} Hours Completed
            </Text>
          </View>

          <View style={styles.workoutContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.workoutHeader}>Today's Workout Plan</Text>
              <TouchableOpacity
                style={styles.logWorkoutButton}
                onPress={updateUserData}
              >
                <Text style={styles.logWorkoutButtonText}>
                  Log Daily Workout
                </Text>
              </TouchableOpacity>
            </View>

            {workouts.details && workouts.details.length > 0 && (
              <WorkoutItem
                title={workouts.details[0].title}
                muscles={workouts.details[0].muscles || "Rest Day"}
                imageSource={workouts.details[0].imageSource}
                navigation={navigation}
              />
            )}
          </View>

          <View style={styles.mealContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.mealHeader}>Current Meal Plan</Text>
            </View>
            <ScrollView
              horizontal
              style={styles.mealItemsContainer}
              showsHorizontalScrollIndicator={false}
            >
              <MealItem
                title="Breakfast"
                description={meals.breakfast.title}
                imageSource={{ uri: meals.breakfast.image }}
                navigation={navigation}
                mealData={meals.breakfast}
              />
              <MealItem
                title="Lunch"
                description={meals.lunch.title}
                imageSource={{ uri: meals.lunch.image }}
                navigation={navigation}
                mealData={meals.lunch}
              />
              <MealItem
                title="Dinner"
                description={meals.dinner.title}
                imageSource={{ uri: meals.dinner.image }}
                navigation={navigation}
                mealData={meals.dinner}
              />
            </ScrollView>
          </View>
        </ScrollView>

        <View style={styles.navigation}>
          <View style={styles.navItem}>
            <HomeIcon />
          </View>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("Workouts")}
          >
            <WorkoutIcon />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("Meals")}
          >
            <MealIcon />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("Profile")}
          >
            <ProfileIcon />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const WorkoutItem = ({
  title,
  muscles,
  imageSource,
  navigation,
}: WorkoutItemProps) => {
  return (
    <TouchableOpacity
      style={styles.workoutItem}
      onPress={() => navigation.navigate("WorkoutPlan")}
    >
      <Image source={placeholderImge} style={styles.workoutImage} />
      <View style={styles.overlay}>
        <Text
          style={styles.workoutTitle}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        <Text
          style={styles.workoutMuscles}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {muscles}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

interface MealItemProps {
  title: string;
  description: string;
  imageSource: any;
  navigation: any;
  mealData?: any;
}

const MealItem = ({
  title,
  description,
  imageSource,
  navigation,
  mealData,
}: MealItemProps) => {
  const validImageSource =
    imageSource &&
    typeof imageSource.uri === "string" &&
    imageSource.uri.startsWith("http")
      ? { uri: imageSource.uri }
      : placeholderImge;

  return (
    <TouchableOpacity
      style={styles.mealItem}
      onPress={() => navigation.navigate("MealDetails", { meal: mealData })}
    >
      <Image source={validImageSource} style={styles.mealImage} />
      <View style={styles.overlay}>
        <Text style={styles.mealTitle} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        <Text
          style={styles.mealDescription}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const HomeIcon = () => (
  <Svg height="28" width="28" viewBox="0 0 56 56">
    <Path
      d="M .6249 27.8242 C .6249 28.9492 1.5155 29.6289 2.6171 29.6289 C 3.2968 29.6289 3.8358 29.3008 4.3046 28.8320 L 27.1796 7.9961 C 27.4374 7.7383 27.7187 7.6445 28.0233 7.6445 C 28.3046 7.6445 28.5624 7.7383 28.8436 7.9961 L 51.6954 28.8320 C 52.1874 29.3008 52.7264 29.6289 53.3826 29.6289 C 54.4842 29.6289 55.3751 28.9492 55.3751 27.8242 C 55.3751 27.1211 55.1173 26.6758 54.6719 26.2774 L 46.5623 18.8945 L 46.5623 5.0430 C 46.5623 4.0117 45.9061 3.3555 44.8751 3.3555 L 41.8046 3.3555 C 40.7968 3.3555 40.0936 4.0117 40.0936 5.0430 L 40.0936 13.0117 L 30.8124 4.5274 C 29.9921 3.7539 28.9843 3.3789 27.9999 3.3789 C 27.0155 3.3789 26.0312 3.7539 25.1874 4.5274 L 1.3280 26.2774 C .9062 26.6758 .6249 27.1211 .6249 27.8242 Z M 7.3280 47.4883 C 7.3280 50.7461 9.2968 52.6445 12.6015 52.6445 L 22.0936 52.6445 L 22.0936 35.9805 C 22.0936 34.9023 22.8202 34.1992 23.8984 34.1992 L 32.1718 34.1992 C 33.2499 34.1992 33.9531 34.9023 33.9531 35.9805 L 33.9531 52.6445 L 43.4216 52.6445 C 46.7264 52.6445 48.6719 50.7461 48.6719 47.4883 L 48.6719 30.3320 L 28.7734 12.4023 C 28.5155 12.1679 28.2343 12.0508 27.9531 12.0508 C 27.6952 12.0508 27.4374 12.1679 27.1562 12.4258 L 7.3280 30.4492 Z"
      fill="#9A2CE8"
    />
  </Svg>
);

// Header
// MarginTop = 90 == 15%
// MarginLeft = 20 == 6%
// MarginBottom = 20 == 3%
// MarginTop = 90 == 15%

// Containers
// marginLeft = 25 == 6%
// marginBottom = 30 == 7%
// width = 375 == 88%

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000", // bg color for whole screen
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    marginTop: "2%",
    marginLeft: "6%",
    marginBottom: "7%",
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 25,
    marginRight: 20,
  },
  headerTextContainer: {
    marginTop: 1,
  },
  headerText: {
    fontSize: 20,
    fontFamily: "SFProRounded-Heavy",
    color: "#fff",
  },
  nameText: {
    fontSize: 14,
    marginTop: 5,
    fontFamily: "SFProText-Light",
    color: "#fff",
  },
  goalContainer: {
    width: "88%",
    backgroundColor: "#323232",
    borderRadius: 20,
    padding: 15,
    marginLeft: "6%",
    marginBottom: "7%",
  },
  goalBold: {
    marginTop: 15,
    color: "#fff",
    fontFamily: "SFProRounded-Heavy",
    fontSize: 18,
    marginBottom: 8,
  },
  goalLight: {
    fontSize: 14,
    marginTop: "2%",
    alignSelf: "center",
    fontFamily: "SFProText-Light",
    color: "#fff",
    marginBottom: "10%",
  },
  goalPercentage: {
    color: "#fff",
    fontFamily: "SFProText-Light",
    fontSize: 15,
    marginBottom: 15,
  },
  progressBar: {
    height: 9,
    flexDirection: "row",
    backgroundColor: "#000000",
    borderRadius: 10,
    marginBottom: 10,
  },
  progress: {
    height: "100%",
    maxWidth: "100%",
    backgroundColor: "#9A2CE8",
    borderRadius: 10,
  },
  glow: {
    shadowColor: "#9A2CE8",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  progressText: {
    fontSize: 10,
    fontFamily: "SFProRounded-Light",
    color: "#fff",
    marginTop: 5,
    alignSelf: "flex-end",
  },
  scrollContainer: {
    height: 200,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(52, 52, 52, 1)",
    padding: 10,
    marginTop: 110,
    borderRadius: 10,
    justifyContent: "space-evenly",
    alignItems: "center",
    opacity: 0.8,
  },
  workoutContainer: {
    marginTop: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 1,
    paddingHorizontal: "7%",
  },
  workoutHeader: {
    fontSize: 18,
    fontFamily: "SFProRounded-Heavy",
    color: "#fff",
  },
  logWorkoutButton: {
    backgroundColor: "#9A2CE8",
    borderRadius: 20,
    paddingVertical: "2.5%",
    paddingHorizontal: 15,
  },
  logWorkoutButtonText: {
    fontFamily: "SFProRounded-Heavy",
    color: "#FFFFFF",
    fontSize: 11,
  },
  workoutItem: {
    width: "88%",
    height: 180,
    backgroundColor: "#444",
    borderRadius: 20,
    marginLeft: "6%",
    marginTop: 10,
    marginBottom: 20,
    overflow: "hidden",
  },
  workoutImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  workoutTitle: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "SFProRounded-Regular",
    textAlign: "center",
  },
  workoutMuscles: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "SFProText-Light",
    textAlign: "center",
  },
  mealContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  mealItemsContainer: {
    marginTop: 10,
    flexDirection: "row",
  },
  mealHeader: {
    fontSize: 18,
    fontFamily: "SFProRounded-Heavy",
    color: "#fff",
  },
  mealItem: {
    width: screenWidth / 2.2,
    height: 180,
    backgroundColor: "#444",
    borderRadius: 20,
    marginLeft: screenWidth * 0.06,
    marginBottom: 30,
    overflow: "hidden",
  },
  mealImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  mealTitle: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "SFProRounded-Regular",
    textAlign: "center",
  },
  mealDescription: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "SFProText-Light",
    textAlign: "center",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 46,
    borderTopColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
});

export default Dashboard;
