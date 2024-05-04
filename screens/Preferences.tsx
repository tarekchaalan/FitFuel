// Tarek Chaalan
// Project Completed: May 3, 2024

import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
  ViewStyle,
} from "react-native";
import { auth, firestore } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import Slider from "@react-native-community/slider";
import { BackIcon } from "../svgs";
import { StackNavigationProp } from "@react-navigation/stack";
import { createMealPlan } from "./CreateMealPlan";
import { createWorkoutPlan } from "./CreateWorkoutPlan";

interface PreferencesProps {
  navigation: StackNavigationProp<any, any>;
}

export interface UserPreferences {
  query: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  currentWeight: number;
  targetWeight: number;
  currentPhysique: "Lean" | "Balanced" | "Fuller";
  targetPhysique: "Lean" | "Balanced" | "Muscular";
  height: number;
  dietaryRestrictions: string[];
  foodAllergies: string[];
  preferredFoods: string[];
  dislikedFoods: string[];
  workoutFrequencyPerWeek: number;
  workoutDuration: number;
  fitnessLevel: string;
  activityLevel: "Sedentary" | "Light" | "Moderate" | "Vigorous";
  intolerances: string[];
  typesOfWorkouts: string[];
}

interface PreferencesState {
  age: number;
  gender: string;
  currentWeight: number;
  targetWeight: number;
  currentPhysique: string;
  targetPhysique: string;
  height: number;
  dietaryRestrictions: string[];
  foodAllergies: string[];
  preferredFoods: string[];
  dislikedFoods: string[];
  workoutFrequencyPerWeek: number;
  workoutDuration: number;
  fitnessLevel: string;
  activityLevel: string;
  intolerances: string[];
  typesOfWorkouts: string[];
}

interface SelectionTagsProps {
  options: string[];
  selectedOptions: string[];
  onSelect: (option: string) => void;
  onDeselect: (option: string) => void;
}

interface TagInputProps {
  field: keyof PreferencesState;
}

const Preferences = ({ navigation }: { navigation: any }) => {
  const [preferences, setPreferences] = useState<PreferencesState>({
    age: 10,
    gender: "",
    currentWeight: 50,
    targetWeight: 50,
    currentPhysique: "",
    targetPhysique: "",
    height: 53,
    dietaryRestrictions: [],
    foodAllergies: [],
    preferredFoods: [],
    dislikedFoods: [],
    workoutFrequencyPerWeek: 1,
    workoutDuration: 30,
    fitnessLevel: "",
    activityLevel: "",
    intolerances: [],
    typesOfWorkouts: [],
  });

  // Fetch user preferences from Firestore
  useEffect(() => {
    const fetchPreferences = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(firestore, "preferences", user.uid);
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const validGenders: Array<"Male" | "Female" | "Other"> = [
              "Male",
              "Female",
              "Other",
            ];
            const gender = validGenders.includes(data.gender)
              ? data.gender
              : "Other";

            // Ensure the type here by casting or validating
            setPreferences((prevState) => ({
              ...prevState,
              ...data,
              gender: gender as "Male" | "Female" | "Other",
              dietaryRestrictions: data.dietaryRestrictions ?? [],
              foodAllergies: data.foodAllergies ?? [],
              preferredFoods: data.preferredFoods ?? [],
              dislikedFoods: data.dislikedFoods ?? [],
              workoutFrequencyPerWeek: data.workoutFrequencyPerWeek ?? 0,
              workoutDuration: data.workoutDuration ?? 0,
              fitnessLevel: data.fitnessLevel ?? "",
              activityLevel: data.activityLevel ?? "",
            }));
            setSelectedIntolerances(data.intolerances || []);
            setSelectedDietaryRestrictions(data.dietaryRestrictions || []);
            setSelectedTypesofWorkouts(data.typesOfWorkouts || []);
          } else {
            // console.log("No user preferences found.");
          }
        } catch (error) {
          // console.error("Error fetching user preferences: ", error);
        }
      }
    };

    fetchPreferences();
  }, []);

  const [selectedIntolerances, setSelectedIntolerances] = useState<string[]>(
    []
  );
  const [selectedDietaryRestrictions, setSelectedDietaryRestrictions] =
    useState<string[]>([]);
  const [selectedTypesofWorkouts, setSelectedTypesofWorkouts] = useState<
    string[]
  >([]);

  const handleSliderChange = (name: keyof PreferencesState, value: number) => {
    setPreferences({ ...preferences, [name]: value });
  };

  const handleInputChange = (
    name: keyof PreferencesState,
    value: string | number | string[]
  ) => {
    setPreferences({ ...preferences, [name]: value });
  };

  const addTag = (field: keyof PreferencesState, tag: string) => {
    if (!tag.trim()) return;
    setPreferences((prevState) => {
      const currentField = prevState[field];
      const newTags = Array.isArray(currentField)
        ? [...currentField, tag]
        : [tag];
      return { ...prevState, [field]: newTags };
    });
  };

  const removeTag = (field: keyof PreferencesState, index: number) => {
    setPreferences((prevState) => {
      const currentField = prevState[field];
      const newTags = Array.isArray(currentField)
        ? currentField.filter((_, i) => i !== index)
        : [];
      return { ...prevState, [field]: newTags };
    });
  };

  const savePreferencesToFirestore = async () => {
    const user = auth.currentUser;
    if (user) {
      const validGenders = ["Male", "Female", "Other"]; // Allowed gender types
      const gender = preferences.gender;
      const genderIsValid = validGenders.includes(gender); // Validate gender

      const updatedPreferences: UserPreferences = {
        ...preferences,
        gender: genderIsValid
          ? (gender as "Male" | "Female" | "Other")
          : "Other", // Ensuring type safety
        dietaryRestrictions: selectedDietaryRestrictions,
        intolerances: selectedIntolerances,
        typesOfWorkouts: selectedTypesofWorkouts,
        activityLevel: preferences.activityLevel as
          | "Sedentary"
          | "Light"
          | "Moderate"
          | "Vigorous",
        currentPhysique: preferences.currentPhysique as
          | "Lean"
          | "Balanced"
          | "Fuller",
        targetPhysique: preferences.targetPhysique as
          | "Lean"
          | "Balanced"
          | "Muscular",
        query: "", // Ensuring query is included
      };

      try {
        await setDoc(
          doc(firestore, "preferences", user.uid),
          updatedPreferences,
          { merge: true }
        );
        Alert.alert("Success", "Preferences saved successfully", [
          { text: "OK", onPress: () => navigation.navigate("Dashboard") },
        ]);
        // console.log("Preferences saved successfully");
        // Passing user.uid as a second argument to createMealPlan
        await createMealPlan(updatedPreferences, user.uid);
        await createWorkoutPlan(updatedPreferences, user.uid);
      } catch (error) {
        // console.error("Error saving to Firestore:", error);
        Alert.alert("Error", "Failed to save preferences.");
      }
    } else {
      Alert.alert("Error", "No authenticated user found.");
    }
  };

  const SelectionTags = ({
    options,
    selectedOptions,
    onSelect,
    onDeselect,
  }: SelectionTagsProps) => (
    <View style={styles.tagsInputContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.tag,
            selectedOptions.includes(option)
              ? { backgroundColor: "#9A2CE8" }
              : { backgroundColor: "#333" },
          ]}
          onPress={() =>
            selectedOptions.includes(option)
              ? onDeselect(option)
              : onSelect(option)
          }
        >
          <Text style={styles.tagText}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const TagInput = ({ field }: TagInputProps) => (
    <View>
      <TextInput
        style={styles.tagInput}
        onSubmitEditing={({ nativeEvent: { text } }) => addTag(field, text)}
        placeholder="Type here..."
        placeholderTextColor="#777"
        returnKeyType="done"
        underlineColorAndroid="transparent"
      />
      <View style={styles.tagsContainer}>
        {(preferences[field] as string[]).map((item, index) => (
          <View
            key={index}
            style={[styles.tag, { backgroundColor: "#9A2CE8" }]}
          >
            <Text style={{ color: "#FFF" }}>{item}</Text>
            <TouchableOpacity onPress={() => removeTag(field, index)}>
              <Text style={[styles.tagRemoveText]}>x</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  interface OptionBoxProps {
    label: string;
    selected: boolean;
    onPress: () => void;
    fontSize?: number;
  }

  const OptionBox: React.FC<OptionBoxProps> = ({
    label,
    selected,
    onPress,
    fontSize = 16,
  }) => {
    const containerStyle: ViewStyle = {
      borderWidth: 2,
      borderColor: "#9A2CE8",
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: selected ? "#9A2CE8" : "transparent",
    };

    return (
      <TouchableOpacity onPress={onPress} style={containerStyle}>
        <Text style={[styles.optionText, { fontSize }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const intolerancesOptions = [
    "Dairy",
    "Eggs",
    "Gluten",
    "Peanuts",
    "Sesame",
    "Seafood",
    "Shellfish",
    "Soy",
    "Sulfites",
    "Tree Nuts",
    "Wheat",
    "None",
  ];
  const dietaryRestrictionsOptions = [
    "Pescatarian",
    "Lacto Vegetarian",
    "Ovo Vegetarian",
    "Vegan",
    "Paleo",
    "Primal",
    "Vegetarian",
    "None",
  ];
  const typeOfWorkoutOptions = [
    "Cardio",
    "Weightlifting",
    "Powerlifting",
    "Strength",
    "Stretching",
    "Plyometrics",
    "None",
  ];

  const toggleIntolerance = (intolerance: string) => {
    if (intolerance === "None") {
      setSelectedIntolerances(["None"]);
    } else {
      setSelectedIntolerances((current) =>
        current.includes("None") || current.includes(intolerance)
          ? current.filter((i) => i !== "None" && i !== intolerance)
          : [...current, intolerance]
      );
    }
  };

  const toggleDietaryRestriction = (restriction: string) => {
    if (restriction === "None") {
      setSelectedDietaryRestrictions(["None"]);
    } else {
      setSelectedDietaryRestrictions((current) =>
        current.includes("None") || current.includes(restriction)
          ? current.filter((r) => r !== "None" && r !== restriction)
          : [...current, restriction]
      );
    }
  };

  const toggleTypeOfWorkout = (restriction: string) => {
    if (restriction === "None") {
      setSelectedTypesofWorkouts(["None"]);
    } else {
      setSelectedTypesofWorkouts((current) =>
        current.includes("None") || current.includes(restriction)
          ? current.filter((r) => r !== "None" && r !== restriction)
          : [...current, restriction]
      );
    }
  };

  const formatHeight = (inches: number) => {
    const feet = Math.floor(inches / 12);
    const inchesRemaining = inches % 12;
    return `${feet}'${inchesRemaining}"`;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <ScrollView style={styles.container}>
          <View style={styles.BackContainer}>
            <TouchableOpacity
              style={styles.BackIcon}
              onPress={() => navigation.navigate("Dashboard")}
            >
              <BackIcon />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Let's get to know you!</Text>

          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeader}>Personal Information</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Age: {preferences.age}</Text>
            <Slider
              value={preferences.age}
              onValueChange={(value) => handleSliderChange("age", value)}
              minimumValue={10}
              maximumValue={100}
              step={1}
              thumbTintColor="#9A2CE8"
              minimumTrackTintColor="#9A2CE8"
              maximumTrackTintColor="#333"
              style={styles.slider}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              Height: {formatHeight(preferences.height)}
            </Text>
            <Slider
              value={preferences.height}
              onValueChange={(value) => handleSliderChange("height", value)}
              minimumValue={53}
              maximumValue={96}
              step={1}
              thumbTintColor="#9A2CE8"
              minimumTrackTintColor="#9A2CE8"
              maximumTrackTintColor="#333"
              style={styles.slider}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.multioptions}>
              {["Male", "Female", "Other"].map((gender) => (
                <OptionBox
                  key={gender}
                  label={gender}
                  selected={preferences.gender === gender}
                  onPress={() => handleInputChange("gender", gender)}
                  fontSize={16}
                />
              ))}
            </View>
          </View>

          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeader}>Physical Attributes</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Current Physique</Text>
            <View style={styles.multioptions}>
              {["Lean", "Balanced", "Fuller"].map((currentPhysique) => (
                <OptionBox
                  key={currentPhysique}
                  label={currentPhysique}
                  selected={preferences.currentPhysique === currentPhysique}
                  onPress={() =>
                    handleInputChange("currentPhysique", currentPhysique)
                  }
                  fontSize={16}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Target Physique</Text>
            <View style={styles.multioptions}>
              {["Lean", "Balanced", "Muscular"].map((targetPhysique) => (
                <OptionBox
                  key={targetPhysique}
                  label={targetPhysique}
                  selected={preferences.targetPhysique === targetPhysique}
                  onPress={() =>
                    handleInputChange("targetPhysique", targetPhysique)
                  }
                  fontSize={16}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              Current Weight: {preferences.currentWeight} lbs
            </Text>
            <Slider
              value={preferences.currentWeight}
              onValueChange={(value) =>
                handleSliderChange("currentWeight", value)
              }
              minimumValue={50}
              maximumValue={400}
              step={1}
              thumbTintColor="#9A2CE8"
              minimumTrackTintColor="#9A2CE8"
              maximumTrackTintColor="#333"
              style={styles.slider}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              Target Weight: {preferences.targetWeight} lbs
            </Text>
            <Slider
              value={preferences.targetWeight}
              onValueChange={(value) =>
                handleSliderChange("targetWeight", value)
              }
              minimumValue={50}
              maximumValue={400}
              step={1}
              thumbTintColor="#9A2CE8"
              minimumTrackTintColor="#9A2CE8"
              maximumTrackTintColor="#333"
              style={styles.slider}
            />
          </View>

          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeader}>Dietary Preferences</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Intolerances</Text>
            <SelectionTags
              options={intolerancesOptions}
              selectedOptions={selectedIntolerances}
              onSelect={toggleIntolerance}
              onDeselect={toggleIntolerance}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Dietary Restrictions</Text>
            <SelectionTags
              options={dietaryRestrictionsOptions}
              selectedOptions={selectedDietaryRestrictions}
              onSelect={toggleDietaryRestriction}
              onDeselect={toggleDietaryRestriction}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.preferredContainer}>
              <Text style={styles.label}>Preferred Foods</Text>
              <Text style={styles.subLabel}>(eg. Chicken, Pasta, etc)</Text>
            </View>
            <TagInput field="preferredFoods" />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Disliked Foods</Text>
            <TagInput field="dislikedFoods" />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Food Allergies</Text>
            <TagInput field="foodAllergies" />
          </View>

          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeader}>Fitness Routine</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              Workout Frequency Per Week: {preferences.workoutFrequencyPerWeek}
            </Text>
            <Slider
              value={preferences.workoutFrequencyPerWeek}
              onValueChange={(value) =>
                handleSliderChange("workoutFrequencyPerWeek", value)
              }
              minimumValue={1}
              maximumValue={7}
              step={1}
              thumbTintColor="#9A2CE8"
              minimumTrackTintColor="#9A2CE8"
              maximumTrackTintColor="#333"
              style={styles.slider}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>
              Workout Duration: {preferences.workoutDuration} minutes
            </Text>
            <Slider
              value={preferences.workoutDuration}
              onValueChange={(value) =>
                handleSliderChange("workoutDuration", value)
              }
              minimumValue={30}
              maximumValue={120}
              step={5}
              thumbTintColor="#9A2CE8"
              minimumTrackTintColor="#9A2CE8"
              maximumTrackTintColor="#333"
              style={styles.slider}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Type of Workout</Text>
            <SelectionTags
              options={typeOfWorkoutOptions}
              selectedOptions={selectedTypesofWorkouts}
              onSelect={toggleTypeOfWorkout}
              onDeselect={toggleTypeOfWorkout}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Activity Level</Text>
            <View style={styles.multioptions}>
              {["Sedentary", "Light", "Moderate", "Vigorous"].map((level) => (
                <OptionBox
                  key={level}
                  label={level}
                  selected={preferences.activityLevel === level}
                  onPress={() => handleInputChange("activityLevel", level)}
                  fontSize={10}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Fitness Level</Text>
            <View style={styles.multioptions}>
              {["Beginner", "Intermediate", "Expert"].map((level) => (
                <OptionBox
                  key={level}
                  label={level}
                  selected={preferences.fitnessLevel === level}
                  onPress={() => handleInputChange("fitnessLevel", level)}
                  fontSize={13}
                />
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={savePreferencesToFirestore}
          >
            <Text style={styles.buttonText}>Save Preferences</Text>
          </TouchableOpacity>
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
  BackContainer: {
    alignItems: "flex-start",
    marginLeft: "5%",
    marginTop: "2%",
  },
  BackIcon: {},
  title: {
    marginTop: "2%",
    marginLeft: "6%",
    fontSize: 24,
    color: "#9A2CE8",
    fontFamily: "SFProRounded-Heavy",
  },
  section: {
    marginBottom: "5%",
    paddingHorizontal: "6%",
  },
  sectionHeaderContainer: {
    marginLeft: "6%",
    marginBottom: "3%",
    marginTop: "5%",
    paddingBottom: "1%",
    width: "85%",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.4)",
  },
  sectionHeader: {
    fontSize: 24,
    color: "#FFF",
    fontFamily: "SFProRounded-Heavy",
  },
  preferredContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  label: {
    fontSize: 18,
    color: "#FFF",
    fontFamily: "SFProRounded-Regular",
    marginBottom: "3%",
  },
  subLabel: {
    fontSize: 12,
    fontFamily: "SFProRounded-Light",
    color: "#FFF",
    marginLeft: "3%",
    marginTop: "1%",
  },
  slider: {
    marginLeft: "3%",
    width: "93%",
    height: 40,
  },
  multioptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: "2%",
  },
  containerStyle: {},
  optionBox: {
    borderWidth: 2,
    borderColor: "#9A2CE8",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    color: "#FFF",
    fontFamily: "SFProRounded-Regular",
    fontSize: 18,
  },
  button: {
    backgroundColor: "#9A2CE8",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: "6%",
    marginBottom: 20,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: "SFProRounded-Regular",
  },
  tagsInputContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  tagInput: {
    backgroundColor: "#333",
    color: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    fontFamily: "SFProRounded-Regular",
    minWidth: "30%",
    maxWidth: "93%",
    height: 30,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: "#555",
    borderRadius: 10,
    marginRight: 10,
    marginBottom: "3%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    color: "#FFF",
    fontSize: 14,
    fontFamily: "SFProRounded-Regular",
  },
  tagRemoveText: {
    color: "#FFF",
    marginLeft: 10,
    fontSize: 18,
    fontFamily: "SFProRounded-Heavy",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
});

export default Preferences;
