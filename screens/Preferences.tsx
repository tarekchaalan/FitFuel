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
import Svg, { Path } from "react-native-svg";
import { StackNavigationProp } from "@react-navigation/stack";

interface PreferencesProps {
  navigation: StackNavigationProp<any, any>;
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
  dislikedFoods: string[];
  workoutFrequencyPerWeek: number;
  workoutDuration: number;
  fitnessLevel: string;
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
    dislikedFoods: [],
    workoutFrequencyPerWeek: 1,
    workoutDuration: 30,
    fitnessLevel: "",
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
            const userPreferences = docSnap.data(); // Directly accessing the preferences data
            setPreferences((prevState) => ({
              ...prevState,
              ...userPreferences,
              dietaryRestrictions: userPreferences.dietaryRestrictions ?? [],
              foodAllergies: userPreferences.foodAllergies ?? [],
              dislikedFoods: userPreferences.dislikedFoods ?? [],
              workoutFrequencyPerWeek:
                userPreferences.workoutFrequencyPerWeek ?? 0,
              workoutDuration: userPreferences.workoutDuration ?? 0,
              fitnessLevel: userPreferences.fitnessLevel ?? "",
            }));
            setSelectedIntolerances(userPreferences.intolerances || []);
            setSelectedDietaryRestrictions(
              userPreferences.dietaryRestrictions || []
            );
            setSelectedTypesofWorkouts(userPreferences.typesOfWorkouts || []);
          } else {
            console.log("No user preferences found.");
          }
        } catch (error) {
          console.error("Error fetching user preferences: ", error);
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
      // Ensure the latest selections are included in the preferences object
      const updatedPreferences = {
        ...preferences,
        dietaryRestrictions: selectedDietaryRestrictions,
        intolerances: selectedIntolerances,
        typesOfWorkouts: selectedTypesofWorkouts,
      };

      // Use the "preferences" collection and the user's UID for the document ID
      await setDoc(
        doc(firestore, "preferences", user.uid),
        updatedPreferences,
        {
          merge: true,
        }
      )
        .then(() => {
          Alert.alert("Success", "Preferences saved successfully", [
            { text: "OK", onPress: () => navigation.navigate("Dashboard") },
          ]);
        })
        .catch((error) => console.error("Error saving to Firestore:", error));
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
            <Text style={[styles.tagText, { color: "#FFF" }]}>{item}</Text>
            <TouchableOpacity onPress={() => removeTag(field, index)}>
              <Text style={[styles.tagRemoveText, { color: "#FFF" }]}>x</Text>
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
    width?: string; // Specify that width should only be a string
  }

  const OptionBox: React.FC<OptionBoxProps> = ({
    label,
    selected,
    onPress,
    fontSize = 16,
    width = "30%",
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
      width: "30%",
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

  const BackIcon = () => (
    <Svg height="28" width="28" viewBox="0 0 456 600">
      <Path
        d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"
        fill="#fff"
      />
    </Svg>
  );

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
                  fontSize={13}
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
                  fontSize={14}
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
                  fontSize={13}
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
              maximumValue={14}
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
            <Text style={styles.label}>Fitness Level</Text>
            <View style={styles.multioptions}>
              {["Beginner", "Intermediate", "Expert"].map((level) => (
                <OptionBox
                  key={level}
                  label={level}
                  selected={preferences.fitnessLevel === level}
                  onPress={() => handleInputChange("fitnessLevel", level)}
                  fontSize={11}
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
    fontWeight: "bold",
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
    fontWeight: "bold",
  },
  label: {
    fontSize: 18,
    color: "#FFF",
    marginBottom: "3%",
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
  },
  tagRemoveText: {
    color: "#FFF",
    marginLeft: 10,
    fontSize: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
});

export default Preferences;
