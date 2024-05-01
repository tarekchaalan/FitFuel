import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  route: any;
}

const WorkoutDetails: React.FC<Props> = ({ route }) => {
  const { name, difficulty, equipment, instructions, image } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{name}</Text>
      <Text>Difficulty: {difficulty}</Text>
      <Text>Target Muscle: {image}</Text>
      <Text>Equipment Needed: {equipment}</Text>
      <Text>Instructions: {instructions}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default WorkoutDetails;
