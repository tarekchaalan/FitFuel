import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Animated,
} from "react-native";
import { Svg, Path } from "react-native-svg";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { Camera, requestCameraPermissionsAsync, CameraType } from "expo-camera";
import { getAuth } from "firebase/auth";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import axios from "axios";

const db = getFirestore();
const auth = getAuth();

const BackIcon = () => (
  <Svg height="28" width="28" viewBox="0 0 456 600">
    <Path
      d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"
      fill="#fff"
    />
  </Svg>
);

const ResultsIcon = () => (
  <Svg height="28" width="28" viewBox="0 0 384 512">
    <Path
      d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM80 64h64c8.8 0 16 7.2 16 16s-7.2 16-16 16H80c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64h64c8.8 0 16 7.2 16 16s-7.2 16-16 16H80c-8.8 0-16-7.2-16-16s7.2-16 16-16zm16 96H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V256c0-17.7 14.3-32 32-32zm0 32v64H288V256H96zM240 416h64c8.8 0 16 7.2 16 16s-7.2 16-16 16H240c-8.8 0-16-7.2-16-16s7.2-16 16-16z"
      fill="#fff"
    />
  </Svg>
);

const ScanEquipment = ({ navigation }: { navigation: any }) => {
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [image, setImage] = useState<string | null>(null);
  const cameraRef = useRef<Camera>(null);
  const [snapEffectOpacity] = useState(new Animated.Value(0));
  const overlayRef = useRef<any>(null);

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
      console.error("Failed to upload image", error);
      Alert.alert("Upload Error", "Failed to upload image.");
      throw error; // Rethrow or handle as needed
    }
  };

  const detectAndUploadEquipment = async (imageUrl: string, userId: string) => {
    try {
      // List of API endpoints you want to call
      const apiEndpoints = [
        "https://detect.roboflow.com/all-gym-equipment/2", // My custom model
        "https://detect.roboflow.com/gym-equipment-object-detection/1",
        // "https://outline.roboflow.com/gym-equipment-segmentation/1",
        // "https://detect.roboflow.com/healnion-f4l32/1",
        // "https://detect.roboflow.com/yolov5-gpr7k/1",
        // "https://detect.roboflow.com/equipment-recognition/2",
      ];

      // Make parallel requests to all endpoints
      const apiRequests = apiEndpoints.map((endpoint) =>
        axios
          .post(endpoint, null, {
            params: {
              api_key: "3iODpfE9UZifrPc4qDUi",
              image: imageUrl,
            },
          })
          .then((response) => ({
            source: endpoint,
            predictions: response.data.predictions,
          }))
      );

      // Wait for all requests to complete
      const responses = await Promise.all(apiRequests);

      // Combine all predictions from all responses and keep track of their source URLs
      let allPredictions: any = [];
      responses.forEach(({ source, predictions }) => {
        allPredictions = allPredictions.concat(
          predictions.map((prediction: any) => ({
            ...prediction,
            source,
          }))
        );
      });

      // Check if the combined predictions array is empty
      if (allPredictions.length === 0) {
        Alert.alert("No equipment detected", "Please try another image.");
        return;
      }

      // Find the prediction with the highest confidence across all responses
      const highestConfidencePrediction = allPredictions.reduce(
        (prev: any, current: any) => {
          return prev.confidence > current.confidence ? prev : current;
        }
      );

      const confidencePercentage =
        Math.round(highestConfidencePrediction.confidence * 100 * 100) / 100;

      console.log(
        `Highest confidence prediction came from: ${highestConfidencePrediction.source}`
      );

      // Prepare to show the alert with options
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
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Error detecting equipment or saving to Firestore:", error);
      Alert.alert("Error", "There was a problem with the image processing.");
    }
  };

  const saveDetection = async (prediction: any, userId: any, imageUrl: any) => {
    try {
      const userScansRef = doc(db, "PrivateGymEquipment", userId);
      await setDoc(
        userScansRef,
        { data: { ...prediction, imageUrl } },
        { merge: true }
      );
      console.log("Detection saved successfully.");
      Alert.alert("Success", "Detection has been saved to the database.");
    } catch (error) {
      console.error("Error saving detection to Firestore:", error);
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
  pageHeader: {
    fontSize: 20,
    fontFamily: "SFProRounded-Heavy",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
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
    marginTop: "10%",
    width: "100%",
    height: "100%",
    marginBottom: 20,
  },
  captureButton: {
    position: "absolute",
    bottom: 0,
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
