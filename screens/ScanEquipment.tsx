// TODO: Fix Xbutton Render Error

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
  Button,
} from "react-native";
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
      const querySnapshot = await getDocs(
        query(collection(db, "Gyms"), orderBy("created", "desc"))
      );
      const gymsList = querySnapshot.docs.map((doc) => doc.id);
      setGyms(gymsList);
      if (gymsList.length > 0) {
        setSelectedGym(gymsList[0]); // Automatically select the most recently created gym
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
        setSelectedGym(gyms[0]); // Fallback to the most recent gym if no stored selection is valid
      }
    };
    loadSelectedGym();
  }, [gyms]); // Depend on gyms so it re-runs when gyms are fetched

  const handleNewGymSave = () => {
    if (newGymName.trim() !== "" && !gyms.includes(newGymName)) {
      const newGymRef = doc(db, "Gyms", newGymName);
      setDoc(newGymRef, { created: new Date() }) // Store the creation date
        .then(() => {
          console.log("New gym saved and selected");
          const newGymsList = [...gyms, newGymName];
          setGyms(newGymsList); // Update the list of gyms
          setSelectedGym(newGymName); // Set the newly created gym as the selected gym
          setIsNewGymModalVisible(false);
        })
        .catch((error) => {
          console.error("Error saving new gym:", error);
          Alert.alert("Error", "Failed to save new gym");
        });
    } else {
      Alert.alert("Error", "Invalid or duplicate gym name");
    }
  };

  const deleteGym = async (gymName: any) => {
    const updatedGyms = gyms.filter((gym) => gym !== gymName);
    setGyms(updatedGyms);
    if (gymName === selectedGym) {
      setSelectedGym(updatedGyms[0] || ""); // Set to the first gym or empty string if none left
    }

    // Firestore deletion
    const gymRef = doc(db, "Gyms", gymName);
    try {
      await deleteDoc(gymRef);
      Alert.alert("Success", "Gym deleted successfully.");
    } catch (error) {
      console.error("Error deleting gym:", error);
      Alert.alert("Error", "Failed to delete gym.");
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
      console.log("Fetching image from URI");
      const response = await fetch(uri);
      console.log("Converting to blob");
      const blob = await response.blob();
      console.log("Blob size:", blob.size);
      console.log("Creating storage reference");
      const storageRef = ref(
        storage,
        `GymEquipment/${userId}/${new Date().toISOString()}`
      );
      console.log("Storage ref:", storageRef.fullPath);
      console.log("Uploading bytes");
      await uploadBytes(storageRef, blob);
      console.log("Getting download URL");
      const url = await getDownloadURL(storageRef);
      console.log("Upload complete", url);
      return url;
    } catch (error) {
      console.error("Failed to upload image:", error);
      Alert.alert("Upload Error", "Failed to upload image.");
      throw error; // Rethrow or handle as needed
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
            text: "Save",
            onPress: () =>
              saveDetection(highestConfidencePrediction, userId, imageUrl),
          },
          {
            text: "Cancel",
            onPress: () => console.log("Detection not saved."),
          },
        ]
      );
    } catch (error) {
      console.error("Error detecting equipment:", error);
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
      const gymEquipmentRef = collection(db, "Gyms", selectedGym, "Scans");
      const newEquipmentRef = doc(gymEquipmentRef);
      await setDoc(newEquipmentRef, {
        class: prediction.class,
        confidence: prediction.confidence,
        imageUrl: imageUrl,
      });

      console.log("Detection saved successfully.");
      Alert.alert("Success", "Detection has been saved to the database.");
    } catch (error) {
      console.error("Error saving detection:", error);
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
    console.log("Starting picture capture process...");
    setImage(null);
    const user = auth.currentUser;
    if (!user) {
      console.error("No user logged in");
      Alert.alert(
        "User Error",
        "You must be logged in to perform this action."
      );
      return;
    }

    if (!cameraRef.current || !auth.currentUser) {
      Alert.alert("Error", "Camera not ready or user not authenticated");
      return;
    }

    try {
      console.log("Taking picture...");
      const photo = await cameraRef.current.takePictureAsync();
      console.log("Picture taken:", photo.uri);

      setImage(photo.uri);
      console.log("Starting upload...");
      const imageUrl = await uploadGymEquipmentImage(
        photo.uri,
        auth.currentUser.uid
      );
      console.log("Image uploaded, URL:", imageUrl);

      console.log("Detecting equipment...");
      await detectAndUploadEquipment(imageUrl, auth.currentUser.uid);
      console.log("Equipment detection and upload complete.");
    } catch (error) {
      let errorMessage = "Failed to do something exceptional";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error(
        "Error during the capture or upload process:",
        errorMessage
      );
      Alert.alert(
        "Capture or Upload Error",
        errorMessage || "An error occurred"
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
          <View style={styles.noteContainer}>
            <Text style={styles.noteTitle}>Instructions</Text>
            <Text style={styles.noteText}>
              Simply take images of the equipment in your gym, this will allow
              us to come up with customized workout plans.
              {"\n"}
              {"\n"}
              You should only proceed to the next page if you are working out at
              a <Text style={styles.noteTextDecorated}>PRIVATE</Text> gym.
              {"\n"}
              Please scan one machine at a time.
              {"\n"}
              {"\n"}
              If you have already scanned your equipment before, go back,
              there's no need to re-scan unless theres something you missed.
              {"\n"}
              {"\n"}
              If you are working out at a{" "}
              <Text style={styles.noteTextDecorated}>PUBLIC</Text> gym, we will
              assume that you have access to all gym equipment, and there is NO
              NEED for you to scan anything.
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
          {/* Snap Effect Overlay */}
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
    marginTop: 10,
  },
  noteText: {
    fontSize: 20,
    fontFamily: "SFProText-Light",
    color: "#fff",
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
    fontWeight: "bold",
    textAlign: "center",
  },
  textStyle: {
    color: "black",
    fontSize: 24,
    fontWeight: "bold",
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
