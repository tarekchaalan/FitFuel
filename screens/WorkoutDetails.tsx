// Tarek Chaalan
// Project Completed: May 3, 2024

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BackIcon } from "../svgs"; // Import your BackIcon component
import { ScrollView } from "react-native-gesture-handler";
import { ImageSourcePropType } from "react-native";

const muscleImages: Record<string, ImageSourcePropType> = {
  abdominals: require("../assets/images/muscleGroups/abs.png"),
  back: require("../assets/images/muscleGroups/back.png"),
  biceps: require("../assets/images/muscleGroups/biceps.png"),
  calves: require("../assets/images/muscleGroups/calfs.png"),
  chest: require("../assets/images/muscleGroups/chest.png"),
  forearms: require("../assets/images/muscleGroups/forearms.png"),
  glutes: require("../assets/images/muscleGroups/gluteus.png"),
  hamstrings: require("../assets/images/muscleGroups/hamstring.png"),
  quadriceps: require("../assets/images/muscleGroups/quadriceps.png"),
  shoulders: require("../assets/images/muscleGroups/shoulders.png"),
  triceps: require("../assets/images/muscleGroups/triceps.png"),
};

interface Props {
  route: any;
}

const WorkoutDetails: React.FC<Props> = ({ route }) => {
  const { name, difficulty, muscle, equipment, instructions, image } =
    route.params;

  const navigation = useNavigation(); // Hook to access navigation functions

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.IconsContainer}>
            <TouchableOpacity
              style={styles.BackIcon}
              onPress={() => navigation.goBack()}
            >
              <BackIcon />
            </TouchableOpacity>
          </View>
          <Text style={styles.pageHeader}>Workout Details</Text>
          <Text style={styles.header}>Workout Name</Text>
          <Text style={styles.content}>{name}</Text>

          <Text style={styles.header}>Difficulty</Text>
          <Text style={styles.content}>{difficulty}</Text>

          <Text style={styles.header}>Target Muscle</Text>
          <Text style={styles.content}>{muscle}</Text>
          <Image
            source={muscleImages[muscle.toLowerCase()]}
            style={styles.muscleImage}
            resizeMode="contain"
          />
          <Text style={styles.header}>Equipment Needed</Text>
          <Text style={styles.content}>{equipment}</Text>

          <Text style={styles.header}>Instructions</Text>
          <Text style={styles.content}>{instructions}</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000", // bg color for whole screen
  },
  container: {
    flex: 1,
    backgroundColor: "#000", // Black background color
    padding: 20,
  },
  IconsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: "5%",
    marginRight: "5%",
    marginTop: "2%",
  },
  BackIcon: {},
  pageHeader: {
    fontSize: 36,
    fontFamily: "SFProRounded-Heavy",
    color: "#fff",
    alignSelf: "center",
    marginBottom: 10,
    marginTop: 10,
  },

  header: {
    fontSize: 18,
    fontFamily: "SFProRounded-Heavy",
    marginTop: 20,
    color: "#fff", // White text color
  },
  content: {
    fontSize: 16,
    fontFamily: "SFProRounded-Regular",
    marginBottom: 10,
    textTransform: "capitalize",
    color: "#fff", // White text color
  },
  muscleImage: {
    width: "90%", // Set as appropriate for your layout
    height: 300,
    alignSelf: "center",
    marginBottom: 10,
  },
});

export default WorkoutDetails;
