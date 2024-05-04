// Tarek Chaalan
// Project Completed: May 3, 2024

import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  FlatList,
  Alert,
  Animated,
  TextInput,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { BackIcon, ResultsIcon, DownArrow, XButton } from "../svgs";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { Camera, requestCameraPermissionsAsync, CameraType } from "expo-camera";
import { getAuth } from "firebase/auth";
import {
  doc,
  setDoc,
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const db = getFirestore();
const auth = getAuth();

interface GymItemProps {
  item: string; // Assuming item is a string.
  onDelete: (item: string) => void;
  onSelect: (item: string) => void;
}

const ScanEquipment = ({ navigation }: { navigation: any }) => {
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [image, setImage] = useState<string | null>(null);
  const cameraRef = useRef<Camera>(null);
  const [snapEffectOpacity] = useState(new Animated.Value(0));
  const overlayRef = useRef<any>(null);
  const [gyms, setGyms] = useState<string[]>([]);
  const [selectedGym, setSelectedGym] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isNewGymModalVisible, setIsNewGymModalVisible] = useState(false);
  const [newGymName, setNewGymName] = useState("");

  // Fetch existing gyms from Firestore
  useEffect(() => {
    const fetchGyms = async () => {
      const user = auth.currentUser;
      if (user) {
        const gymsCollectionRef = collection(db, "Gyms", user.uid, "UserGyms");
        const querySnapshot = await getDocs(
          query(gymsCollectionRef, orderBy("created", "desc"))
        );
        const gymsList = querySnapshot.docs.map((doc) => doc.id);
        setGyms(gymsList);
        if (gymsList.length > 0) {
          setSelectedGym(gymsList[0]);
        }
      } else {
        // Handle case where user is not logged in
        // console.log("User not authenticated");
      }
    };
    fetchGyms();
  }, []);

  const updateSelectedGym = async (gymName: any) => {
    setSelectedGym(gymName);
    await AsyncStorage.setItem("selectedGym", gymName);
  };

  // When the component mounts, check AsyncStorage for the last selected gym
  useEffect(() => {
    const loadSelectedGym = async () => {
      const storedGymName = await AsyncStorage.getItem("selectedGym");
      if (storedGymName && gyms.includes(storedGymName)) {
        setSelectedGym(storedGymName);
      } else if (gyms.length > 0) {
        setSelectedGym(gyms[0]);
      }
    };
    loadSelectedGym();
  }, [gyms]); // Depend on gyms so it re-runs when gyms are fetched

  const handleNewGymSave = async () => {
    const user = auth.currentUser;
    if (user && newGymName.trim() !== "" && !gyms.includes(newGymName)) {
      const newGymRef = doc(db, "Gyms", user.uid, "UserGyms", newGymName);
      setDoc(newGymRef, { created: new Date() })
        .then(() => {
          // console.log("New gym saved and selected");
          const newGymsList = [...gyms, newGymName];
          setGyms(newGymsList);
          setSelectedGym(newGymName);
          setIsNewGymModalVisible(false);
        })
        .catch((error) => {
          // console.error("Error saving new gym:", error);
          Alert.alert("Error", "Failed to save new gym");
        });
    } else {
      Alert.alert(
        "Error",
        "Invalid or duplicate gym name or user not logged in"
      );
    }
  };

  const deleteGym = async (gymName: string) => {
    const user = auth.currentUser;
    if (user) {
      const gymRef = doc(db, "Gyms", user.uid, "UserGyms", gymName);
      try {
        await deleteDoc(gymRef);
        const updatedGyms = gyms.filter((g) => g !== gymName);
        setGyms(updatedGyms);
        setSelectedGym(updatedGyms[0] || "");
        Alert.alert("Success", "Gym deleted successfully.");
      } catch (error) {
        // console.error("Error deleting gym:", error);
        Alert.alert("Error", "Failed to delete gym.");
      }
    } else {
      Alert.alert(
        "User Error",
        "You must be logged in to perform this action."
      );
    }
  };

  const handleCameraLaunch = async () => {
    const { status } = await requestCameraPermissionsAsync();
    setHasCameraPermission(status === "granted");

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need camera permissions to make this work!"
      );
    }
  };

  const uploadGymEquipmentImage = async (uri: any, userId: any) => {
    try {
      // console.log("Fetching image from URI");
      const response = await fetch(uri);
      // console.log("Converting to blob");
      const blob = await response.blob();
      // console.log("Blob size:", blob.size);
      // console.log("Creating storage reference");
      const storageRef = ref(
        storage,
        `GymEquipment/${userId}/${new Date().toISOString()}`
      );
      // console.log("Storage ref:", storageRef.fullPath);
      // console.log("Uploading bytes");
      await uploadBytes(storageRef, blob);
      // console.log("Getting download URL");
      const url = await getDownloadURL(storageRef);
      // console.log("Upload complete", url);
      return url;
    } catch (error) {
      // console.error("Failed to upload image:", error);
      Alert.alert("Upload Error", "Failed to upload image.");
      throw error;
    }
  };

  const detectAndUploadEquipment = async (imageUrl: any, userId: any) => {
    try {
      const apiEndpoint = "https://detect.roboflow.com/all-gym-equipment/2";
      const response = await axios.post(apiEndpoint, null, {
        params: { api_key: "3iODpfE9UZifrPc4qDUi", image: imageUrl },
      });
      const predictions = response.data.predictions;
      if (!predictions.length) {
        Alert.alert("No equipment detected", "Please try another image.");
        return;
      }
      const highestConfidencePrediction = predictions.reduce(
        (prev: any, current: any) => {
          return prev.confidence > current.confidence ? prev : current;
        }
      );
      const confidencePercentage = (
        highestConfidencePrediction.confidence * 100
      ).toFixed(2);
      Alert.alert(
        "Equipment Detected",
        `We detected: ${highestConfidencePrediction.class} with a confidence of ${confidencePercentage}%. Do you want to save this detection?`,
        [
          {
            text: "Cancel",
            // onPress: () => console.log("Detection not saved."),
          },
          {
            text: "Save",
            onPress: () =>
              saveDetection(highestConfidencePrediction, userId, imageUrl),
          },
        ]
      );
    } catch (error) {
      // console.error("Error detecting equipment:", error);
      Alert.alert(
        "Detection Error",
        "An error occurred during equipment detection."
      );
    }
  };

  const saveDetection = async (prediction: any, userId: any, imageUrl: any) => {
    try {
      if (!selectedGym) {
        Alert.alert("Error", "No gym selected.");
        return;
      }
      // Correct the reference to include the user ID and use the "UserGyms" subcollection
      const gymEquipmentRef = collection(
        db,
        "Gyms",
        userId,
        "UserGyms",
        selectedGym,
        "Scans"
      );
      const newEquipmentRef = doc(gymEquipmentRef);
      await setDoc(newEquipmentRef, {
        class: prediction.class,
        confidence: prediction.confidence,
        imageUrl: imageUrl,
      });

      // console.log("Detection saved successfully.");
      Alert.alert("Success", "Detection has been saved to the database.");
    } catch (error) {
      // console.error("Error saving detection:", error);
      Alert.alert("Save Error", "Failed to save detection.");
    }
  };

  const takePictureAndUpload = async () => {
    // Ensure the overlay is active before starting the animation
    if (overlayRef.current) {
      overlayRef.current.setNativeProps({ pointerEvents: "auto" });
    }

    Animated.sequence([
      Animated.timing(snapEffectOpacity, {
        toValue: 1,
        duration: 100, // Duration of the fade in
        useNativeDriver: true,
      }),
      Animated.timing(snapEffectOpacity, {
        toValue: 0,
        duration: 100, // Duration of the fade out
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (overlayRef.current) {
        overlayRef.current.setNativeProps({ pointerEvents: "none" });
      }
    });

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("You must be logged in to perform this action.");
      }

      if (!cameraRef.current) {
        throw new Error("Camera not ready or user not authenticated");
      }

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
      });
      setImage(photo.uri);

      const imageUrl = await uploadGymEquipmentImage(photo.uri, user.uid);
      await detectAndUploadEquipment(imageUrl, user.uid);
    } catch (error) {
      // console.error("Error during the capture or upload process:", error);
      Alert.alert(
        "Capture or Upload Error",
        (error as Error).message || "An unexpected error occurred"
      );
    }
  };

  const GymItem = ({ item, onDelete, onSelect }: GymItemProps) => {
    return (
      <View style={styles.dropdownItemRow}>
        <TouchableOpacity
          style={styles.dropdownItem}
          onPress={() => onSelect(item)}
        >
          <Text style={styles.itemText}>{item}</Text>
        </TouchableOpacity>
        {item !== "Create new gym..." && (
          <TouchableOpacity onPress={() => onDelete(item)}>
            <XButton />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (hasCameraPermission === null || hasCameraPermission === false) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="light-content" />
          <View style={styles.IconsContainer}>
            <TouchableOpacity
              style={styles.BackIcon}
              onPress={() => navigation.navigate("Workouts")}
            >
              <BackIcon />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ResultsIcon}
              onPress={() => navigation.navigate("EquipmentResult")}
            >
              <ResultsIcon />
            </TouchableOpacity>
          </View>
          <Text style={styles.noteTitle}>Instructions</Text>
          <ScrollView style={styles.scrollView}>
            <View style={styles.noteContainer}>
              <Text style={styles.noteText}>
                Simply take images of the equipment in your gym, this will allow
                us to come up with customized workout plans.
                {"\n"}
                {"\n"}
                You should only proceed to the next page if you are working out
                at a <Text style={styles.noteTextDecorated}>PRIVATE</Text> gym.
                {"\n"}
                Please scan one machine at a time.
                {"\n"}
                {"\n"}
                If you have already scanned your equipment before, go back,
                there's no need to re-scan unless there's something you missed.
                {"\n"}
                {"\n"}
                If you are working out at a{" "}
                <Text style={styles.noteTextDecorated}>PUBLIC</Text> gym, we
                will assume that you have access to all gym equipment, and there
                is NO NEED for you to scan anything.
              </Text>
            </View>
            <View style={styles.grantContainer}>
              <TouchableOpacity
                style={styles.grantButton}
                onPress={handleCameraLaunch}
              >
                <Text style={styles.grantText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.IconsContainer}>
          <TouchableOpacity
            style={styles.BackIcon}
            onPress={() => navigation.navigate("Workouts")}
          >
            <BackIcon />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ResultsIcon}
            onPress={() => navigation.navigate("EquipmentResult")}
          >
            <ResultsIcon />
          </TouchableOpacity>
        </View>
        <View>
          <Text style={styles.pageHeader}>Scan Equipment</Text>
        </View>
        <View style={styles.gymDropdown}>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => setDropdownVisible(!dropdownVisible)}
          >
            <Text style={styles.triggerText}>
              {selectedGym || "Select Gym"}
            </Text>
            <DownArrow />
          </TouchableOpacity>
          {dropdownVisible && (
            <FlatList
              data={[...gyms, "Create new gym..."]}
              style={styles.dropdownList}
              renderItem={({ item }) => (
                <GymItem
                  item={item}
                  onDelete={deleteGym}
                  onSelect={(item) => {
                    if (item === "Create new gym...") {
                      setIsNewGymModalVisible(true);
                    } else {
                      setSelectedGym(item);
                      setDropdownVisible(false);
                    }
                  }}
                />
              )}
              keyExtractor={(item) => item} // Assuming item names are unique
            />
          )}
          <Modal
            animationType="slide"
            transparent={true}
            visible={isNewGymModalVisible}
            onRequestClose={() => {
              setIsNewGymModalVisible(false);
            }}
          >
            <TouchableOpacity
              style={styles.centeredView}
              activeOpacity={1}
              onPressOut={() => {
                setIsNewGymModalVisible(false);
              }}
            >
              <View style={styles.modalContent}>
                <TextInput
                  style={styles.input}
                  onChangeText={setNewGymName}
                  value={newGymName}
                  placeholder="Enter new gym name"
                />
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleNewGymSave}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
        <View style={styles.scanButton}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={CameraType.back}
            ratio={"4:3"}
          />
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePictureAndUpload}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          <Animated.View
            ref={overlayRef}
            style={[
              styles.overlay,
              {
                opacity: snapEffectOpacity,
              },
            ]}
            pointerEvents="none" // Initially, don't intercept touches
          />
        </View>
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
  ResultsIcon: {},
  scrollView: {},
  noteContainer: {
    marginLeft: "5%",
    marginRight: "5%",
    marginTop: "2%",
  },
  noteTitle: {
    fontSize: 36,
    fontFamily: "SFProRounded-Heavy",
    color: "#fff",
    marginBottom: 20,
    alignSelf: "center",
    marginTop: 10,
  },
  noteText: {
    fontSize: 20,
    fontFamily: "SFProText-Light",
    color: "#fff",
    marginBottom: "10%",
  },
  noteTextDecorated: {
    color: "#9A2CE8",
    fontFamily: "SFProText-Heavy",
  },
  grantContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  grantButton: {
    borderRadius: 20,
    width: "40%",
    padding: 10,
    elevation: 2,
    backgroundColor: "#fff",
  },
  grantText: {
    color: "#000",
    fontSize: 24,
    fontFamily: "SFProRounded-Heavy",
    textAlign: "center",
  },
  textStyle: {
    color: "black",
    fontSize: 24,
    fontFamily: "SFProRounded-Heavy",
    textAlign: "center",
  },
  pageHeader: {
    fontSize: 20,
    fontFamily: "SFProRounded-Heavy",
    color: "#fff",
    textAlign: "center",
    marginBottom: 5,
  },
  gymDropdown: {
    marginHorizontal: 20,
  },
  dropdownTrigger: {
    flexDirection: "row", // Ensures the text and the arrow are on the same line
    alignItems: "center",
    padding: 10,
  },
  triggerText: {
    marginRight: 5,
    fontSize: 18,
    color: "#fff",
    fontFamily: "SFProRounded-Heavy",
  },
  dropdownList: {
    borderWidth: 1,
  },
  dropdownItemRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Ensures space distribution
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
    width: "100%", // Ensures it covers full width of its container
  },
  dropdownItem: {
    flex: 1,
  },
  itemText: {
    color: "#fff",
    fontFamily: "SFProRounded-Regular",
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent background
  },
  modalContent: {
    width: "80%", // Set the width of the modal content
    backgroundColor: "white",
    borderRadius: 5,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: "center", // Center items vertically in the modal
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    backgroundColor: "#fff",
    fontFamily: "SFProRounded-Regular",
    color: "#000",
  },
  saveButton: {
    backgroundColor: "#007BFF", // Bootstrap primary blue
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "SFProRounded-Regular",
    textAlign: "center",
  },
  scanButton: {
    padding: 10,
    backgroundColor: "#000",
    borderRadius: 20,
    height: "80%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    marginTop: 10,
    width: "100%",
    height: "100%",
  },
  captureButton: {
    position: "absolute",
    bottom: "5%",
    alignSelf: "center",
    width: 60,
    height: 60,
    borderRadius: 35,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "#aaa",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "white",
  },
});

export default ScanEquipment;
