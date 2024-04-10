import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Svg, { Path } from "react-native-svg";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Define the interfaces for the data structure
interface NutritionalInfo {
  calories: string;
  carbohydrates: string;
  fat: string;
  fiber: string;
  protein: string;
  saturatedFat: string;
  sodium: string;
}

interface ProductScan {
  image_url: string;
  name: string;
  nutritional_info: NutritionalInfo;
}

const fetchScans = async (): Promise<ProductScan[]> => {
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;
  const scans: ProductScan[] = [];

  if (user) {
    const userScansRef = collection(db, "MacroBarcodeScans");
    const querySnapshot = await getDocs(userScansRef);

    querySnapshot.forEach((document) => {
      if (document.id === user.uid) {
        const data = document.data();
        if (Array.isArray(data.scans)) {
          data.scans.forEach((scan: any) => {
            scans.push({
              image_url: scan.image_url,
              name: scan.name,
              nutritional_info: scan.nutritional_info,
            });
          });
        }
      }
    });
  }
  return scans;
};

const MacroResult = ({ navigation }: { navigation: any }) => {
  const [scans, setScans] = useState<ProductScan[]>([]);

  useEffect(() => {
    fetchScans().then(setScans);
  }, []);

  const handleDelete = async (scanToDelete: any) => {
    const db = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userDoc = doc(db, "MacroBarcodeScans", user.uid);
      await updateDoc(userDoc, {
        scans: arrayRemove(scanToDelete),
      });

      // Remove the item from local state to update the UI
      setScans((scans) => scans.filter((scan) => scan !== scanToDelete));
    }
  };

  const renderRightActions = (progress: any, dragX: any, onPress: any) => {
    // Use the interpolate function to create a smooth transition
    const opacity = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <Animated.View style={[styles.deleteBox, { opacity }]}>
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.BackContainer}>
        <TouchableOpacity
          style={styles.BackIcon}
          onPress={() => navigation.navigate("MacroChecker")}
        >
          <BackIcon />
        </TouchableOpacity>
      </View>
      <Text style={styles.pageHeader}>Macro Results</Text>
      <ScrollView>
        {scans.map((scan: any, index: any) => (
          <Swipeable
            key={index}
            renderRightActions={(progress, dragX) =>
              renderRightActions(progress, dragX, () => handleDelete(scan))
            }
            friction={1}
          >
            <TouchableOpacity
              key={index}
              style={styles.scanRow}
              onPress={() =>
                navigation.navigate("BarcodeResults", { productInfo: scan })
              }
            >
              <Image
                source={{ uri: scan.image_url }}
                style={styles.scanImage}
                resizeMode="cover"
              />
              <Text style={styles.scanText}>{scan.name}</Text>
            </TouchableOpacity>
          </Swipeable>
        ))}
      </ScrollView>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("MacroChecker");
        }}
      >
        <View style={styles.buttons}>
          <Text style={styles.buttonText}>Scan</Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const BackIcon = () => (
  <Svg height="28" width="28" viewBox="0 0 456 600">
    <Path
      d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"
      fill="#fff"
    />
  </Svg>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000", // bg color for whole screen
  },
  container: {
    flex: 1,
    justifyContent: "space-between", // This will align the content to the top and the nav to the bottom
  },
  BackIcon: {},
  BackContainer: {
    alignItems: "flex-start",
    marginLeft: "5%",
    marginTop: "2%",
  },
  pageHeader: {
    fontSize: 20,
    fontFamily: "SFProRounded-Heavy",
    color: "#fff",
    alignSelf: "center",
  },
  scanRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "#ffffff33",
    borderBottomWidth: 1,
    paddingVertical: 10, // Adjust as needed for spacing
    height: 150,
  },
  scanImage: {
    height: 100,
    width: 100,
    marginRight: 10,
  },
  scanText: {
    color: "#fff",
    fontFamily: "SFProRounded-Heavy",
    fontSize: 18,
  },
  deleteBox: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "flex-end",
    height: 150,
    width: 100,
  },
  deleteText: {
    color: "#fff",
    fontSize: 18,
    padding: 25,
    fontFamily: "SFProRounded-Light",
  },
  buttons: {
    backgroundColor: "#9A2CE8",
    borderRadius: 20,
    paddingVertical: 10,
    elevation: 2,
    alignSelf: "center",
    width: "30%",
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
  },
});

export default MacroResult;
