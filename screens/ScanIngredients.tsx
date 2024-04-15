// TODO

import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import {
  Camera,
  CameraType,
  CameraCapturedPicture,
  requestCameraPermissionsAsync,
} from "expo-camera";
import { BackIcon, ResultsIcon } from "../svgs";
import axios from "axios";

const ScanIngredients = ({ navigation }: { navigation: any }) => {
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const cameraRef = useRef<Camera>(null);

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

  const takePictureAndUpload = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      console.log("Picture taken:", photo.uri);
      detectIngredients(photo.uri);
    }
  };
  //AIzaSyATIwQpoEwr8iE8E7SqEbca5JEIdTVrf_w
  const detectIngredients = async (uri: string) => {
    const apiKey = "AIzaSyATIwQpoEwr8iE8E7SqEbca5JEIdTVrf_w"; // Your actual API key
    const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    const base64Image = await convertImageToBase64(uri);

    const body = {
      requests: [
        {
          features: [{ type: "OBJECT_LOCALIZATION" }],
          image: { content: base64Image },
        },
      ],
    };

    try {
      const response = await axios.post(url, body);
      // Extracting the 'name' field from localizedObjectAnnotations
      const objects =
        response.data.responses[0].localizedObjectAnnotations || [];
      const objectNames = objects.map((object: any) => object.name).join("\n");
      Alert.alert(
        "Detected Ingredients",
        objectNames || "No ingredients detected."
      );
    } catch (error) {
      console.error("Google Vision API Error: ", error);
      Alert.alert(
        "Error",
        "Failed to process the image with Google Vision API"
      );
    }
  };

  // Updated function with better error handling and type assertions
  const convertImageToBase64 = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Ensure reader.result is treated as a string
        if (typeof reader.result === "string") {
          resolve(reader.result.split(",")[1]);
        } else {
          reject(new Error("Unexpected result type"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  if (hasCameraPermission === null || hasCameraPermission === false) {
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
            <TouchableOpacity
              style={styles.ResultsIcon}
              onPress={() => navigation.navigate("IngredientsResult")}
            >
              <ResultsIcon />
            </TouchableOpacity>
          </View>
          <View style={styles.noteContainer}>
            <Text style={styles.noteTitle}>Instructions (TODO)</Text>
            <Text style={styles.noteText}>
              To tailor-make your meal plans, simply snap or upload pictures of
              the items in your{" "}
              <Text style={styles.noteTextDecorated}>
                Fridge / Cabinet / Drawers
              </Text>
              . This helps our system offer you customized recipes.
              {"\n"}
              {"\n"}
              <Text style={styles.noteTextDecorated}>
                Prefer not to scan?
              </Text>{" "}
              No worries, we can suggest some basic and easy-to-make recipes,
              though you might not have all of the required ingredients.
              {"\n"}
              {"\n"}
              Keep your inventory updated, especially after grocery shopping, to
              ensure our recommendations stay fresh and relevant. You can rescan
              your items or manually add new ones to the list.
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
            onPress={() => navigation.navigate("Meals")}
          >
            <BackIcon />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ResultsIcon}
            onPress={() => navigation.navigate("IngredientsResult")}
          >
            <ResultsIcon />
          </TouchableOpacity>
        </View>
        <View>
          <Text style={styles.pageHeader}>Scan Ingredients</Text>
        </View>
        <View style={styles.scanButton}>
          <Camera
            style={styles.camera}
            type={CameraType.back}
            ref={cameraRef}
          />
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePictureAndUpload}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
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
    marginTop: "20%",
    width: "100%",
    height: "95%",
    marginBottom: 20,
  },
  captureButton: {
    position: "absolute",
    bottom: 70,
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
});

export default ScanIngredients;
