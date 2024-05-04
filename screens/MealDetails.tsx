// Tarek Chaalan
// Project Completed: May 3, 2024

import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { BackIcon } from "../svgs";

const MealDetails = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const { meal } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        >
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.title}>{meal.title}</Text>
        <ScrollView>
          <Image source={{ uri: meal.image }} style={styles.image} />
          <Text style={styles.header}>Summary</Text>
          <Text style={styles.text}>{meal.summary}</Text>
          <Text style={styles.header}>Time to make</Text>
          <Text style={styles.text}>{meal.readyInMinutes} minutes</Text>
          <Text style={styles.header}>Servings</Text>
          <Text style={styles.text}>{meal.servings} servings</Text>
          <Text style={styles.header}>Nutrients</Text>
          {meal.nutrients && meal.nutrients.length > 0 ? (
            meal.nutrients.map(
              (
                nutrient: { title: any; amount: any; unit: any },
                index: React.Key | null | undefined
              ) => (
                <Text key={index} style={styles.nutrient}>
                  {`${nutrient.title}: ${nutrient.amount} ${nutrient.unit}`}
                </Text>
              )
            )
          ) : (
            <Text style={styles.nutrient}>No Nutrient Data Available</Text>
          )}
          <Text style={styles.header}>Instructions</Text>
          {meal.instructions && meal.instructions.length > 0 ? (
            meal.instructions.map(
              (
                instruction: { number: any; step: any },
                index: React.Key | null | undefined
              ) => (
                <Text key={index} style={styles.instruction}>
                  {`${instruction.number}. ${instruction.step}`}
                </Text>
              )
            )
          ) : (
            <Text style={styles.instruction}>No Instructions Available</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    padding: 10,
  },
  backIcon: {
    marginVertical: 10,
  },
  title: {
    fontSize: 22,
    fontFamily: "SFProRounded-Heavy",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  header: {
    fontSize: 18,
    fontFamily: "SFProRounded-Heavy",
    color: "#fff",
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "SFProRounded-Regular",
    marginBottom: 20,
  },
  nutrient: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "SFProRounded-Regular",
    marginBottom: 10,
  },
  instruction: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "SFProRounded-Regular",
    marginBottom: 10,
    marginLeft: 10,
  },
});

export default MealDetails;
