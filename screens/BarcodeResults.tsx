// Tarek Chaalan
// Project Completed: May 3, 2024

import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
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
  nutritional_info: NutritionalInfo;
  nutriscore_grade?: string;
}

const saveScan = async (scanData: any, navigation: any) => {
  const user = auth.currentUser;
  if (user) {
    const userDataRef = doc(db, "MacroBarcodeScans", user.uid);
    try {
      // Assuming 'scanData' contains the nutritional info, etc., you want to save
      await setDoc(
        userDataRef,
        {
          scans: arrayUnion(scanData),
        },
        { merge: true }
      );

      Alert.alert("Scan saved in Macro Results successfully");
      navigation.navigate("MacroResult");
    } catch (error) {
      // console.error("Error saving scan: ", error);
      Alert.alert("Failed to save scan");
    }
  } else {
    Alert.alert("No user logged in");
  }
};

const getNutriScoreColor = (grade: string) => {
  if (!grade) {
    return "#dcdcdc"; // Default color if grade is undefined
  }
  const colors: { [grade: string]: string } = {
    a: "#038141", // Green
    b: "#85BB2F", // Light Green
    c: "#FECB02", // Yellow
    d: "#EE8100", // Orange
    e: "#E63E11", // Red
  };
  return colors[grade.toLowerCase()] || "#dcdcdc";
};

const BarcodeResults = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const { productInfo }: { productInfo: ProductInfo } = route.params;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <ScrollView style={styles.scrollView}>
          {productInfo && (
            <>
              <Image
                source={
                  productInfo.image_url !== "PLACEHOLDER"
                    ? { uri: productInfo.image_url }
                    : require("../assets/images/placeholder.png")
                }
                style={styles.productImage}
                resizeMode="contain"
              />
              <Text
                style={styles.productName}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {productInfo.name}
              </Text>
              <View style={styles.nutritionalInfo}>
                <Text style={styles.per100gText}>( Per 100g )</Text>
                {Object.entries(productInfo.nutritional_info).map(
                  ([key, value]) => (
                    <View style={styles.nutrientRow} key={key}>
                      <Text style={styles.nutrientText}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}:
                      </Text>
                      <Text style={styles.nutrientText}>
                        {value && !isNaN(parseFloat(value))
                          ? parseFloat(value).toFixed(2)
                          : "0.00"}
                      </Text>
                    </View>
                  )
                )}
                {productInfo.nutriscore_grade && (
                  <View style={styles.nutriScoreRow}>
                    <Text style={styles.nutrientText}>Nutri-Score:</Text>
                    <View
                      style={{
                        ...styles.nutriScoreBox,
                        backgroundColor: getNutriScoreColor(
                          productInfo.nutriscore_grade
                        ),
                      }}
                    >
                      <Text style={styles.nutriScoreText}>
                        {productInfo.nutriscore_grade.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    navigation.goBack();
                  }}
                >
                  <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => saveScan(productInfo, navigation)}
                >
                  <Text style={styles.buttonText}>Save Scan</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
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
  scrollView: {
    flex: 1, // Ensure ScrollView takes up the whole screen
    backgroundColor: "#000", // Set background color to black
  },
  container: {
    flex: 1,
  },
  productImage: {
    width: "100%", // Use full width to ensure it scales well
    height: 300, // Set a fixed height
    resizeMode: "contain",
    marginTop: 20,
    marginBottom: 20,
  },
  productName: {
    fontSize: 24, // Increase font size
    color: "#fff", // Set text color to white
    fontFamily: "SFProRounded-Heavy",
    textAlign: "center",
    marginBottom: 20,
  },
  nutritionalInfo: {
    alignSelf: "stretch",
    marginBottom: 20,
  },
  per100gText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "SFProRounded-Ultralight",
    textAlign: "right",
    marginBottom: 10,
    marginRight: 10,
  },
  nutrientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15, // Increased space between rows
    paddingBottom: 10, // Add padding to bottom for visual separation
    borderBottomColor: "#ffffff33", // Faint white line, adjust opacity as needed
    borderBottomWidth: 1, // Set the thickness of the line
    marginRight: 10,
  },
  nutrientText: {
    // Style for both nutrient names and values
    fontSize: 20,
    fontFamily: "SFProText-Regular",
    color: "#fff",
    marginLeft: 10,
  },
  nutriScoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Ensure vertical centering within the row
    marginBottom: 15,
    marginRight: 10,
    paddingBottom: 10,
    borderBottomColor: "#ffffff33",
    borderBottomWidth: 1,
  },
  nutriScoreBox: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    backgroundColor: "#dcdcdc", // Default background color
  },
  nutriScoreText: {
    color: "#fff",
    fontFamily: "SFProRounded-Heavy",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#9A2CE8",
    borderRadius: 20,
    paddingVertical: 10,
    elevation: 2,
    width: "40%",
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "SFProRounded-Regular",
    textAlign: "center",
  },
});

export default BarcodeResults;
