import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  FlatList,
  Animated,
  Image,
  Keyboard,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Swipeable } from "react-native-gesture-handler";
import { getAuth } from "firebase/auth";
import axios from "axios";
import { BackIcon } from "../svgs";

const db = getFirestore();
const auth = getAuth();

interface Ingredient {
  id: string;
  name: string;
  image: string;
}

const InputIngredients = ({ navigation }: { navigation: any }) => {
  const [query, setQuery] = useState<string>("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      fetchIngredients(user.uid);
    }
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      setIsLoading(true);
      const fetchSuggestions = async () => {
        const options = {
          method: "GET",
          url: "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/food/ingredients/autocomplete",
          params: { query, number: "10" },
          headers: {
            "X-RapidAPI-Key":
              "e239de4240mshb093dfb4f333ef4p13eaafjsn7207ea6e4c74",
            "X-RapidAPI-Host":
              "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
          },
        };

        try {
          const response = await axios.request(options);
          setIngredients(response.data);
        } catch (error) {
          console.error("Error fetching ingredients:", error);
        }
        setIsLoading(false);
      };
      fetchSuggestions();
    } else {
      setIngredients([]);
      setIsSuggestionsOpen(false);
    }
  }, [query]);

  const fetchIngredients = async (userId: string) => {
    const ingredientsRef = collection(
      db,
      "IngredientsList",
      userId,
      "Ingredients"
    );
    const snapshot = await getDocs(ingredientsRef);
    const ingredientsList = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name, // Ensure the name is extracted
      image: doc.data().image, // Ensure the image is extracted
    }));
    ingredientsList.sort((a, b) => a.name.localeCompare(b.name));
    setSelectedIngredients(ingredientsList);
  };

  const handleSelectIngredient = async (item: any) => {
    const user = auth.currentUser;
    if (
      user &&
      !selectedIngredients.some((ingredient) => ingredient.name === item.name)
    ) {
      const newIngredient = {
        name: item.name,
        image: `https://spoonacular.com/cdn/ingredients_100x100/${item.image}`,
      };

      try {
        const ingredientsRef = collection(
          db,
          "IngredientsList",
          user.uid,
          "Ingredients"
        );
        await addDoc(ingredientsRef, newIngredient);
        fetchIngredients(user.uid); // Re-fetch ingredients to update the list
      } catch (error) {
        console.error("Error adding ingredient:", error);
      }
      setQuery("");
      Keyboard.dismiss();
      setIsSuggestionsOpen(false);
    }
  };

  const handleDelete = async (ingredientId: string) => {
    const user = auth.currentUser;
    if (user) {
      const ingredientDoc = doc(
        db,
        "IngredientsList",
        user.uid,
        "Ingredients",
        ingredientId
      );
      await deleteDoc(ingredientDoc);
      fetchIngredients(user.uid);
    }
  };

  const renderRightActions = (progress: any, dragX: any, onPress: any) => {
    const opacity = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <Animated.View style={[styles.deleteBox, { opacity }]}>
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.IconsContainer}>
          <TouchableOpacity
            style={styles.BackIcon}
            onPress={() => navigation.navigate("Meals")}
          >
            <BackIcon />
          </TouchableOpacity>
        </View>
        <Text style={styles.pageHeader}>Input Ingredients</Text>
        <Text style={styles.pageSubHeader}>
          If you want recipes that are more tailored to your goals, do not input
          any ingredients
        </Text>
        <TextInput
          style={
            isSuggestionsOpen ? styles.searchbarOpen : styles.searchbarClosed
          }
          placeholder="Enter Ingredients..."
          placeholderTextColor="#aaa"
          value={query}
          onChangeText={(newQuery) => {
            setQuery(newQuery);
            setIsSuggestionsOpen(true);
          }}
        />
        {isSuggestionsOpen && (
          <View style={styles.suggestionsList}>
            {isLoading ? (
              <ActivityIndicator
                size="small"
                color="#9A2CE8"
                style={{ top: 20 }}
              />
            ) : (
              <FlatList
                data={ingredients}
                keyExtractor={(item, index) => `${item.name}-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectIngredient(item)}
                  >
                    <Text style={styles.suggestion}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        )}
        <ScrollView style={styles.scrollView}>
          {selectedIngredients.map((ingredient, index) => (
            <Swipeable
              key={ingredient.id}
              renderRightActions={(progress, dragX) =>
                renderRightActions(progress, dragX, () =>
                  handleDelete(ingredient.id)
                )
              }
              friction={1}
            >
              <View key={index} style={styles.ingredientListItem}>
                <Image
                  source={{ uri: ingredient.image }}
                  style={styles.ingredientImage}
                />
                <Text style={styles.ingredientName}>
                  {ingredient.name.charAt(0).toUpperCase() +
                    ingredient.name.slice(1)}
                </Text>
              </View>
            </Swipeable>
          ))}
        </ScrollView>
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
  },
  IconsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: "5%",
    marginRight: "5%",
    marginTop: "2%",
  },
  BackIcon: {},
  scrollView: {
    marginTop: 20,
  },
  pageHeader: {
    fontSize: 36,
    fontFamily: "SFProRounded-Heavy",
    color: "#fff",
    alignSelf: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  pageSubHeader: {
    fontSize: 16,
    fontFamily: "SFProRounded-Ultralight",
    color: "#fff",
    alignSelf: "center",
    textAlign: "center",
    marginBottom: 20,
  },
  searchbarClosed: {
    fontSize: 18,
    fontFamily: "SFProRounded-Regular",
    marginHorizontal: "5%",
    width: "90%",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 30,
    borderColor: "#9A2CE8",
    borderWidth: 1,
    color: "#000",
    shadowColor: "#9A2CE8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  searchbarOpen: {
    fontSize: 18,
    fontFamily: "SFProRounded-Regular",
    marginHorizontal: "5%",
    width: "90%",
    padding: 15,
    backgroundColor: "#fff",
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderColor: "#9A2CE8",
    borderWidth: 1,
    color: "#000",
    shadowColor: "#9A2CE8",
    // Apply shadow only to the top, right, and left sides
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  suggestionsList: {
    minHeight: 60,
    maxHeight: 200,
    width: "90%",
    backgroundColor: "#fff",
    marginHorizontal: "5%",
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderColor: "#9A2CE8",
    borderWidth: 1,
    color: "#000",
    shadowColor: "#9A2CE8",
    // Apply shadow only to the bottom, right, and left sides
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  suggestion: {
    padding: 10,
    fontSize: 16,
    fontFamily: "SFProRounded-Light",
  },
  ingredientListItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: "5%",
  },
  ingredientImage: {
    width: 65,
    height: 65,
    marginRight: 30,
    objectFit: "contain",
  },
  ingredientName: {
    fontSize: 18,
    fontFamily: "SFProRounded-Regular",
    color: "#fff",
  },
  deleteBox: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "flex-end",
    width: 100,
  },
  deleteText: {
    color: "#fff",
    fontSize: 18,
    padding: 25,
    fontFamily: "SFProRounded-Light",
  },
});

export default InputIngredients;
