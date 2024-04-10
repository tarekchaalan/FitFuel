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
import Svg, { Path } from "react-native-svg";
import { useUser } from "../UserContext";
import { getAuth } from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  getFirestore,
  increment,
} from "firebase/firestore";

const db = getFirestore();
const auth = getAuth();

interface ProfilePictureState {
  uri: string;
}

interface WorkoutItemProps {
  title: string;
  muscles: string;
  imageSource: ImageSourcePropType;
  navigation: any;
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

            <WorkoutItem
              title="Workout Group"
              muscles="Work | out | target | muscles"
              imageSource={placeholderImge}
              navigation={navigation}
            />
          </View>

          <View style={styles.mealContainer}>
            <Text style={styles.mealHeader}>This Week's Meal Plan</Text>
            <ScrollView
              horizontal
              style={styles.mealItemsContainer}
              showsHorizontalScrollIndicator={false}
            >
              <MealItem
                title="Breakfast"
                description="Breakfast Meal Name"
                imageSource={placeholderImge}
              />
              <MealItem
                title="Lunch"
                description="Lunch Meal Name"
                imageSource={placeholderImge}
              />
              <MealItem
                title="Dinner"
                description="Dinner Meal Name"
                imageSource={placeholderImge}
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
      onPress={() => navigation.navigate("Workouts")}
    >
      <Image source={placeholderImge} style={styles.workoutImage} />
      <View style={styles.overlay}>
        <Text style={styles.workoutTitle}>{title}</Text>
        <Text style={styles.workoutMuscles}>{muscles}</Text>
      </View>
    </TouchableOpacity>
  );
};

interface MealItemProps {
  title: string;
  description: string;
  imageSource: ImageSourcePropType;
}

const MealItem = ({ title, description, imageSource }: MealItemProps) => (
  <TouchableOpacity style={styles.mealItem}>
    <Image style={styles.mealImage} source={imageSource} />
    <View style={styles.overlay}>
      <Text style={styles.mealTitle}>{title}</Text>
      <Text style={styles.mealDescription}>{description}</Text>
    </View>
  </TouchableOpacity>
);

const HomeIcon = () => (
  <Svg height="28" width="28" viewBox="0 0 56 56">
    <Path
      d="M .6249 27.8242 C .6249 28.9492 1.5155 29.6289 2.6171 29.6289 C 3.2968 29.6289 3.8358 29.3008 4.3046 28.8320 L 27.1796 7.9961 C 27.4374 7.7383 27.7187 7.6445 28.0233 7.6445 C 28.3046 7.6445 28.5624 7.7383 28.8436 7.9961 L 51.6954 28.8320 C 52.1874 29.3008 52.7264 29.6289 53.3826 29.6289 C 54.4842 29.6289 55.3751 28.9492 55.3751 27.8242 C 55.3751 27.1211 55.1173 26.6758 54.6719 26.2774 L 46.5623 18.8945 L 46.5623 5.0430 C 46.5623 4.0117 45.9061 3.3555 44.8751 3.3555 L 41.8046 3.3555 C 40.7968 3.3555 40.0936 4.0117 40.0936 5.0430 L 40.0936 13.0117 L 30.8124 4.5274 C 29.9921 3.7539 28.9843 3.3789 27.9999 3.3789 C 27.0155 3.3789 26.0312 3.7539 25.1874 4.5274 L 1.3280 26.2774 C .9062 26.6758 .6249 27.1211 .6249 27.8242 Z M 7.3280 47.4883 C 7.3280 50.7461 9.2968 52.6445 12.6015 52.6445 L 22.0936 52.6445 L 22.0936 35.9805 C 22.0936 34.9023 22.8202 34.1992 23.8984 34.1992 L 32.1718 34.1992 C 33.2499 34.1992 33.9531 34.9023 33.9531 35.9805 L 33.9531 52.6445 L 43.4216 52.6445 C 46.7264 52.6445 48.6719 50.7461 48.6719 47.4883 L 48.6719 30.3320 L 28.7734 12.4023 C 28.5155 12.1679 28.2343 12.0508 27.9531 12.0508 C 27.6952 12.0508 27.4374 12.1679 27.1562 12.4258 L 7.3280 30.4492 Z"
      fill="#9A2CE8"
    />
  </Svg>
);

const WorkoutIcon = () => (
  <Svg height="40" width="40" viewBox="0 0 50 630">
    <Path
      transform="rotate(45 8.5 8.5)"
      d="M55.465,123.228c-15.547,0-28.159,12.608-28.159,28.161v56.673C11.653,211.908,0,225.928,0,242.765 c0,16.842,11.652,30.861,27.306,34.707v56.666c0,15.555,12.612,28.16,28.159,28.16c15.546,0,28.16-12.605,28.16-28.16V151.389 C83.625,135.837,71.011,123.228,55.465,123.228z"
      fill="#fff"
    />
    <Path
      transform="rotate(45 8.5 8.5)"
      d="M334.498,65.278c-23.092,0-41.811,18.719-41.811,41.812v93.864h-12.801h-60.585h-19.625l-6.827-0.163V107.09 c0-23.092-18.72-41.812-41.813-41.812c-23.091,0-41.812,18.719-41.812,41.812v271.355c0,23.093,18.721,41.812,41.812,41.812 c23.094,0,41.813-18.719,41.813-41.812v-93.653c0,0,4.501-0.211,6.827-0.211h19.625h60.585h12.801v93.864 c0,23.093,18.719,41.812,41.811,41.812c23.094,0,41.812-18.719,41.812-41.812V107.089 C376.311,83.998,357.592,65.278,334.498,65.278z"
      fill="#fff"
    />
    <Path
      transform="rotate(45 8.5 8.5)"
      d="M458.229,208.062v-56.673c0-15.552-12.613-28.161-28.158-28.161c-15.547,0-28.16,12.608-28.16,28.161v182.749 c0,15.555,12.613,28.16,28.16,28.16c15.545,0,28.158-12.605,28.158-28.16v-56.666c15.654-3.846,27.307-17.865,27.307-34.707 C485.535,225.927,473.883,211.908,458.229,208.062z"
      fill="#fff"
    />
  </Svg>
);

const MealIcon = () => (
  <Svg height="28" width="28" viewBox="0 0 456 500">
    <Path
      d="M416 0C400 0 288 32 288 176V288c0 35.3 28.7 64 64 64h32V480c0 17.7 14.3 32 32 32s32-14.3 32-32V352 240 32c0-17.7-14.3-32-32-32zM64 16C64 7.8 57.9 1 49.7 .1S34.2 4.6 32.4 12.5L2.1 148.8C.7 155.1 0 161.5 0 167.9c0 45.9 35.1 83.6 80 87.7V480c0 17.7 14.3 32 32 32s32-14.3 32-32V255.6c44.9-4.1 80-41.8 80-87.7c0-6.4-.7-12.8-2.1-19.1L191.6 12.5c-1.8-8-9.3-13.3-17.4-12.4S160 7.8 160 16V150.2c0 5.4-4.4 9.8-9.8 9.8c-5.1 0-9.3-3.9-9.8-9L127.9 14.6C127.2 6.3 120.3 0 112 0s-15.2 6.3-15.9 14.6L83.7 151c-.5 5.1-4.7 9-9.8 9c-5.4 0-9.8-4.4-9.8-9.8V16zm48.3 152l-.3 0-.3 0 .3-.7 .3 .7z"
      fill="#fff"
    />
  </Svg>
);

const ProfileIcon = () => (
  <Svg height="28" width="28" viewBox="0 0 448 512">
    <Path
      d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"
      fill="#fff"
    />
  </Svg>
);

const PreferencesIcon = () => (
  <Svg height="30" width="30" viewBox="0 0 24 24" fill="none" stroke="#fff">
    <Path
      d="M12 5.5C12 6.88071 10.8807 8 9.5 8C8.11929 8 7 6.88071 7 5.5M12 5.5C12 4.11929 10.8807 3 9.5 3C8.11929 3 7 4.11929 7 5.5M12 5.5H21M7 5.5H3M19 12C19 13.3807 17.8807 14.5 16.5 14.5C15.1193 14.5 14 13.3807 14 12M19 12C19 10.6193 17.8807 9.5 16.5 9.5C15.1193 9.5 14 10.6193 14 12M19 12H21M14 12H3M10 18.5C10 19.8807 8.88071 21 7.5 21C6.11929 21 5 19.8807 5 18.5M10 18.5C10 17.1193 8.88071 16 7.5 16C6.11929 16 5 17.1193 5 18.5M10 18.5H21M5 18.5H3"
      stroke="#fff"
      stroke-width="0.528"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></Path>
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
    justifyContent: "flex-end",
    alignItems: "center",
  },
  workoutContainer: {
    marginTop: 1,
  },
  headerContainer: {
    flexDirection: "row", // Align children in a row
    justifyContent: "space-between", // Justify content to space between
    alignItems: "center", // Align items to center vertically
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
    paddingVertical: 10,
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
  },
  workoutMuscles: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "SFProText-Light",
    marginTop: 10,
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
    marginBottom: "4%",
    marginLeft: "7%",
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
    height: 180,
    resizeMode: "cover",
    marginTop: -20,
    borderRadius: 10,
    overflow: "hidden",
  },
  mealTitle: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "SFProRounded-Regular",
    marginTop: 5,
  },
  mealDescription: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "SFProText-Light",
    marginBottom: 5,
    marginTop: 10,
    justifyContent: "center",
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
