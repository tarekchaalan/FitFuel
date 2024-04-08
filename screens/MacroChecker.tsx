import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { Svg, Path } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import { Camera, requestCameraPermissionsAsync, CameraType } from "expo-camera";

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

const SwitchIcon = () => (
  <Svg height="35" width="35" viewBox="0 0 24 24">
    <Path
      d="M8.70711 4.70711C9.09763 4.31658 9.09763 3.68342 8.70711 3.29289C8.31658 2.90237 7.68342 2.90237 7.29289 3.29289L3.29289 7.29289C2.90237 7.68342 2.90237 8.31658 3.29289 8.70711L7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071C9.09763 12.3166 9.09763 11.6834 8.70711 11.2929L6.41421 9H16C16.5523 9 17 8.55228 17 8C17 7.44772 16.5523 7 16 7H6.41421L8.70711 4.70711ZM20.7071 15.2929L16.7071 11.2929C16.3166 10.9024 15.6834 10.9024 15.2929 11.2929C14.9024 11.6834 14.9024 12.3166 15.2929 12.7071L17.5858 15H8C7.44772 15 7 15.4477 7 16C7 16.5523 7.44772 17 8 17H17.5858L15.2929 19.2929C14.9024 19.6834 14.9024 20.3166 15.2929 20.7071C15.6834 21.0976 16.3166 21.0976 16.7071 20.7071L20.7071 16.7071C21.0976 16.3166 21.0976 15.6834 20.7071 15.2929Z"
      fill="#fff"
    />
  </Svg>
);

const MacroChecker = ({ navigation }: { navigation: any }) => {
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [mode, setMode] = useState<"food" | "barcode" | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await requestCameraPermissionsAsync();
      setHasCameraPermission(status === "granted");
    })();
  }, []);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "food" ? "barcode" : "food"));
  };

  const handlePress = (selectedMode: any) => {
    if (!hasCameraPermission) {
      Alert.alert(
        "Permission Required",
        "We need camera permissions to make this work!"
      );
      return;
    }
    setMode(selectedMode);
  };

  const pickImage = async () => {
    await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true,
    });
  };

  const renderCamera = () => {
    if (mode === "food") {
      return <Camera style={styles.camera} type={CameraType.back}></Camera>;
    } else if (mode === "barcode") {
      return (
        <View style={styles.camera}>
          <View style={styles.blurOverlay} />
          <View style={styles.scannerWindow}>
            <Camera style={styles.fullSize} type={CameraType.back} />
            <View style={styles.scanLineContainer}>
              <View style={styles.scanLine} />
            </View>
          </View>
        </View>
      );
    }
  };

  const pageTitle = mode === "food" ? "Food Scanner" : "Barcode Scanner";

  if (!mode) {
    return (
      <View style={styles.container}>
        {/* UI for selecting the mode */}
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
              onPress={() => navigation.navigate("MacroResult")}
            >
              <ResultsIcon />
            </TouchableOpacity>
          </View>
          <View style={styles.noteContainer}>
            <Text style={styles.noteTitle}>Instructions</Text>
            <Text style={styles.noteText}>
              Simply take or upload images of food {"\n"}
              (making sure most of the ingredients within it are visible)
              {"\n"}
              {"\n"}
              Another option is to scan the barcode if one is available.
              {"\n"}
              {"\n"}
              After scanning, you will be able to view the macros of your food
              in the results page.
            </Text>
          </View>
          <View style={styles.grantContainer}>
            <TouchableOpacity
              style={styles.grantButton}
              onPress={() => handlePress("food")}
            >
              <Text style={styles.grantText}>Scan Food</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.grantButton}
              onPress={() => handlePress("barcode")}
            >
              <Text style={styles.grantText}>Scan Barcode</Text>
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
            onPress={() => setMode(null)}
          >
            <BackIcon />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ResultsIcon}
            onPress={() => navigation.navigate("MacroResult")}
          >
            <ResultsIcon />
          </TouchableOpacity>
        </View>
        <Text style={styles.pageHeader}>
          {mode
            ? mode === "food"
              ? "Food Scanner"
              : "Barcode Scanner"
            : "Select Mode"}
        </Text>
        <View style={styles.scanButton}>
          {renderCamera()}
          <View style={styles.CameraButtons}>
            {mode && (
              <>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={() => {}}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.SwitchButton}
                  onPress={toggleMode}
                >
                  <SwitchIcon />
                </TouchableOpacity>
              </>
            )}
          </View>
          {mode === "food" && (
            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <Text style={styles.textStyle}>Select Photos</Text>
            </TouchableOpacity>
          )}
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
    textDecorationLine: "underline",
  },
  grantContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  grantButton: {
    borderRadius: 20,
    width: "auto",
    padding: 10,
    elevation: 2,
    marginTop: 10,
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
    justifyContent: "center",
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
    width: "110%",
    marginBottom: 10,
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    position: "relative",
  },
  CameraButtons: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "20%",
    flexDirection: "row",
    justifyContent: "center", // Center the capture button
    alignItems: "center",
  },
  captureButton: {
    justifyContent: "center",
    width: 60,
    height: 60,
    borderRadius: 35,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "#aaa",
  },
  SwitchButton: {
    position: "absolute",
    right: 25, // Adjust as needed for padding from the right edge
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    borderRadius: 20,
    width: "40%",
    padding: 10,
    elevation: 2,
    backgroundColor: "#fff",
    marginBottom: 10,
    marginTop: 20,
  },
  blurOverlay: {
    position: "absolute",
  },
  scannerWindow: {
    position: "absolute",
    left: "10%",
    right: "10%",
    top: "10%",
    bottom: "50%",
    borderWidth: 2,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  fullSize: {
    width: "100%",
    height: "100%",
  },
  scanLineContainer: {
    position: "absolute",
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  scanLine: {
    height: 2,
    width: "80%",
    backgroundColor: "red",
  },
});

export default MacroChecker;
