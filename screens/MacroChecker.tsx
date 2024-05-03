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
import { ScrollView } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import { BackIcon, ResultsIcon } from "../svgs";
import { CameraView, Camera } from "expo-camera/next";
import { getAuth } from "firebase/auth";
import { doc, setDoc, arrayUnion, getFirestore } from "firebase/firestore";

const db = getFirestore();
const auth = getAuth();

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

  const handleBarCodeScanned = ({ data }: any) => {
    if (!scanned) {
      setScanned(true);
      const barcode = data.replace(/-/g, "");
      fetchProductInfo(barcode);
    }
  };

  const fetchProductInfo = async (barcode: String) => {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await response.json();
      // console.log(data);
      if (data.product) {
        const nutriments = data.product.nutriments || {};
        const productInfo = {
          image_url: data.product.image_front_url || "PLACEHOLDER",
          name: data.product.product_name || "Name not Found",
          nutritional_info: {
            calories: `${nutriments["energy-kcal_100g"] || "0.00"} kcal`,
            protein: `${nutriments["proteins_100g"] || "0.00"} g`,
            fat: `${nutriments["fat_100g"] || "0.00"} g`,
            saturatedFat: `${nutriments["saturated-fat_100g"] || "0.00"} g`,
            sodium: `${nutriments["sodium_100g"] || "0.00"} g`,
            carbohydrates: `${nutriments["carbohydrates_100g"] || "0.00"} g`,
            fiber: `${nutriments["fiber_100g"] || "0.00"} g`,
          },
          nutriscore_grade: data.product.nutriscore_grade || "Unknown",
        };
        // console.log(productInfo.image_url);
        // console.log(productInfo.name);
        // console.log(productInfo.nutritional_info);
        setProductInfo(productInfo);
        navigation.navigate("BarcodeResults", { productInfo });
      } else {
        Alert.alert(
          "Product Not Found", // Title of the alert
          "Please try scanning again or check the product barcode.", // Message in the alert
          [
            {
              text: "OK",
              onPress: () => {
                // console.log("OK Pressed");
                setScanned(false); // Resetting the scanned state when user presses "OK"
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Failed to fetch product info: ", error);
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
          <Text style={styles.noteTitle}>Instructions</Text>
          <ScrollView style={styles.scrollView}>
            <View style={styles.noteContainer}>
              <Text style={styles.noteText}>
                Simply scan a barcode of any food item
                {/* (making sure most of the ingredients within it are visible) */}
                {"\n"}
                {"\n"}
                {/* Another option is to scan the barcode if one is available.
              {"\n"}
              {"\n"} */}
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
              barcodeTypes: ["ean13"],
            }}
          ></CameraView>
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
    alignSelf: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  noteText: {
    fontSize: 20,
    fontFamily: "SFProText-Light",
    color: "#fff",
    marginBottom: "10%",
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
    marginBottom: 30,
  },
});

export default MacroChecker;
