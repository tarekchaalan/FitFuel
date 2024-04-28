import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  FlatList,
} from "react-native";
import axios from "axios";
import { auth, firestore } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { BackIcon } from "../svgs";

interface Meal {
  title?: string;
  image?: string;
  id?: string;
}

const MealPlan = ({ navigation }: { navigation: any }) => {
  const [meals, setMeals] = useState<Meal[]>([]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.BackContainer}>
          <TouchableOpacity
            style={styles.BackIcon}
            onPress={() => navigation.goBack()}
          >
            <BackIcon />
          </TouchableOpacity>
        </View>
        <Text style={styles.pageHeader}>Meal Plan</Text>
        {/* Textbox for user to input meal plan */}
        <View></View>
        <FlatList
          data={meals}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => alert("Display recipe and nutritional info here.")}
            >
              <Text style={styles.mealItem}>{item.title}</Text>
              <Image source={{ uri: item.image }} style={styles.mealImage} />
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : index.toString()
          }
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  BackIcon: {},
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
  mealItem: {
    padding: 10,
    fontSize: 16,
    color: "#000",
  },
  mealImage: {
    width: 100,
    height: 100,
  },
});

export default MealPlan;
