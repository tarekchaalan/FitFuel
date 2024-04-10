import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Svg, Path } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import { CameraView, Camera } from "expo-camera/next";

interface NutritionalInfo {
  calories: string;
  protein: string;
  fat: string;
  saturatedFat: string;
  sodium: string;
  carbohydrates: string;
  fiber: string;
}

interface ProductInfo {
  image_url: string;
  name: string;
  nutritional_info: NutritionalInfo; // Adding the nutritional_info structure
}

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

const MacroChecker = ({ navigation }: { navigation: any }) => {
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [scanned, setScanned] = useState(false);
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);

  useFocusEffect(
    useCallback(() => {
      setScanned(false);
    }, [])
  );

  const handleCameraLaunch = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasCameraPermission(status === "granted");

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need camera permissions to make this work!"
      );
    }
  };

  const pickImage = async () => {
    await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true,
    });
  };

  const handleBarCodeScanned = ({ data }: any) => {
    if (!scanned) {
      setScanned(true);
      const barcode = data.replace(/-/g, "");
      fetchProductInfo(barcode);
    }
  };

  const fetchProductInfo = async (barcode: string) => {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await response.json();
      if (data.product) {
        const nutriments = data.product.nutriments;
        const productInfo = {
          image_url: data.product.image_front_url,
          name: data.product.product_name,
          nutritional_info: {
            calories: `${nutriments["energy-kcal_100g"]} kcal`,
            protein: `${nutriments["proteins_100g"]} g`,
            fat: `${nutriments["fat_100g"]} g`,
            saturatedFat: `${nutriments["saturated-fat_100g"]} g`,
            sodium: `${nutriments["sodium_100g"]} g`,
            carbohydrates: `${nutriments["carbohydrates_100g"]} g`,
            fiber: `${nutriments["fiber_100g"]} g`,
          },
        };
        setProductInfo(productInfo);
        console.log("Navigating to results page" + barcode + productInfo);
        navigation.navigate("BarcodeResults", { productInfo });
      } else {
        Alert.alert("Product not found");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Failed to fetch product info");
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
            onPress={() => navigation.navigate("MacroResult")}
          >
            <ResultsIcon />
          </TouchableOpacity>
        </View>
        <View>
          <Text style={styles.pageHeader}>Macro Checker</Text>
        </View>
        <View style={styles.scanButton}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "ean13"],
            }}
          ></CameraView>
          <TouchableOpacity style={styles.captureButton} onPress={() => {}}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          <Text style={styles.orText}>OR</Text>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.textStyle}>Select Photos</Text>
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
    width: "100%", // Take up the full width of the screen
    height: "95%",
    marginBottom: 30,
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
  button: {
    borderRadius: 20,
    width: "40%",
    padding: 10,
    elevation: 2,
    backgroundColor: "#fff",
    marginBottom: 10,
    marginTop: 20,
  },
  orText: {
    color: "#fff",
    fontSize: 28,
    fontFamily: "SFProRounded-Heavy",
    textAlign: "center",
  },
});

export default MacroChecker;
