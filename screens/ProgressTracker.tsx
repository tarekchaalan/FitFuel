import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  Image,
  ActionSheetIOS,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { firestore, storage } from "../firebase";
import {
  collection,
  doc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { useNavigation } from "@react-navigation/native";
import { BackIcon, XButton } from "../svgs";
import { getAuth } from "firebase/auth";

const auth = getAuth();

interface ImageDetails {
  id: string;
  imageUrl: string;
}

interface ProgressUpdates {
  [key: string]: ImageDetails[];
}

const ProgressUpdate = () => {
  const navigation = useNavigation();
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdates>({});
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      Alert.alert("Not Logged In", "Please log in to view progress updates.");
      return;
    }

    if (Platform.OS !== "web") {
      (async () => {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Sorry, we need camera roll permissions to make this work!"
          );
        }
      })();
    }

    const unsubscribe = onSnapshot(
      query(
        collection(firestore, "progressUpdates", user.uid, "updates"), // Adjusted the path
        orderBy("date", "desc")
      ),
      (snapshot) => {
        const groupedUpdates: ProgressUpdates = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const formattedDate = data.date.toDate().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          if (!groupedUpdates[formattedDate]) {
            groupedUpdates[formattedDate] = [];
          }
          groupedUpdates[formattedDate].push({
            id: doc.id,
            imageUrl: data.imageUrl,
          });
        });
        setProgressUpdates(groupedUpdates);
      },
      (error) => {
        console.error("Error fetching progress updates: ", error);
        Alert.alert("Error", "Unable to fetch progress updates.");
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddProgress = async () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "Take Photo", "Choose from Gallery"],
        cancelButtonIndex: 0,
      },
      async (buttonIndex) => {
        if (buttonIndex === 1) {
          let result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 1,
          });

          if (result.canceled) {
            // console.log("Camera usage was cancelled.");
            return;
          }

          if (!result.assets || result.assets.length === 0) {
            console.error("No assets found in result");
            return;
          }

          try {
            processImageResult(result);
          } catch (error) {
            console.error("Error processing image result:", error);
          }
        } else if (buttonIndex === 2) {
          let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
          });
          processImageResult(result);
        }
      }
    );
  };

  const processImageResult = async (result: any) => {
    if (!result.cancelled && result.assets) {
      if (!auth.currentUser) {
        // console.log("No user logged in.");
        return;
      }
      await uploadImage(result.assets[0].uri, auth.currentUser.uid);
    }
  };

  const uploadImage = async (uri: string, userId: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const now = new Date();
    const imageRef = ref(
      storage,
      `progressUpdates/${userId}/${
        now.toISOString().split("T")[0]
      }/${now.toISOString()}`
    );
    const snapshot = await uploadBytes(imageRef, blob);
    const url = await getDownloadURL(snapshot.ref);
    const date = Timestamp.fromDate(now);
    const user = auth.currentUser;
    if (user) {
      await addDoc(
        collection(firestore, "progressUpdates", user.uid, "updates"),
        {
          date: date,
          imageUrl: url,
          userId: userId,
        }
      );
    }
  };

  const handleDeleteImage = async (
    imageId: string,
    imageUrl: string
  ): Promise<void> => {
    if (!auth.currentUser) {
      console.error("No user logged in.");
      return;
    }

    // Extract the storage reference from the image URL
    const imageRef = ref(storage, imageUrl);
    const user = auth.currentUser;

    // Delete the image from storage
    try {
      await deleteObject(imageRef);
      // Delete the document from Firestore

      await deleteDoc(
        doc(firestore, "progressUpdates", user.uid, "updates", imageId)
      );
    } catch (error) {
      console.error("Failed to delete image:", error);
      Alert.alert("Deletion Failed", "Failed to delete the image.");
    }
  };

  // Display today's date
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backIcon}
        >
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.header}>Progress Tracker</Text>
        <Text style={styles.dateHeader}>Add an Image</Text>
        <TouchableOpacity style={styles.addBox} onPress={handleAddProgress}>
          <Text style={styles.plusIcon}>+</Text>
        </TouchableOpacity>
        {Object.keys(progressUpdates).map((date) => (
          <View key={date} style={styles.dateSection}>
            <Text style={styles.dateHeader}>{date}</Text>
            <View style={styles.imagesWrapper}>
              {progressUpdates[date].map((item) => (
                <View key={item.id} style={styles.imageContainer}>
                  <TouchableOpacity
                    onPress={() => handleDeleteImage(item.id, item.imageUrl)}
                    style={styles.xButton}
                  >
                    <XButton />
                  </TouchableOpacity>
                  <Image source={{ uri: item.imageUrl }} style={styles.image} />
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    padding: 10,
  },
  backIcon: {
    marginVertical: 10,
  },
  header: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
    marginVertical: 20,
  },
  addBox: {
    borderWidth: 2,
    borderColor: "#9A2CE8",
    borderStyle: "dashed",
    height: 250,
    width: "33%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginRight: "4%",
    borderRadius: 10,
  },
  plusIcon: {
    fontSize: 50,
    color: "#9A2CE8",
  },
  dateSection: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 22,
    fontFamily: "SFProText-Heavy",
    textAlign: "left",
    color: "#fff",
    marginBottom: 10,
  },
  imagesWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 10,
  },
  imageContainer: {
    width: "33%",
    height: 250,
    padding: 5,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    resizeMode: "cover",
  },
  xButton: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 10,
  },
});

export default ProgressUpdate;