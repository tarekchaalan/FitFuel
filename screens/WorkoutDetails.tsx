import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
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
    <View style={styles.container}>
      <ScrollView>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <BackIcon />
        </TouchableOpacity>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Black background color
    padding: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    color: "#fff", // White text color
  },
  content: {
    fontSize: 16,
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
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 1,
  },
});

export default WorkoutDetails;
