import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  Button,
  Alert,
} from "react-native";
import { HomeIcon, WorkoutIcon, MealIcon, SmallEditIcon } from "../svgs";
import Svg, { Path } from "react-native-svg";
import {
  getFirestore,
  doc,
  updateDoc,
  writeBatch,
  onSnapshot,
} from "firebase/firestore";
import {
  getAuth,
  deleteUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getStorage, ref, listAll, deleteObject } from "firebase/storage";
import { auth } from "../firebase";
import { useUser } from "../UserContext";

const db = getFirestore();

const Profile = ({ navigation }: { navigation: any }) => {
  const { currentUser } = useUser();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setphoneNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState(
    require("../assets/images/profile-placeholder.jpg")
  );
  const [editMode, setEditMode] = useState(false);
  const [editField, setEditField] = useState({
    field: "",
    value: "",
  });
  const user = auth.currentUser;

  const handleUpdate = async () => {
    if (!currentUser || !editField.field) {
      Alert.alert("Error", "No user data found.");
      return;
    }

    if (user) {
      const userDoc = doc(db, "users", user.uid);
      try {
        await updateDoc(userDoc, {
          [editField.field]: editField.value,
        });
        setEditMode(false);
        Alert.alert("Success", "Your information has been updated.");
        // Update local state or context if necessary
      } catch (error) {
        console.error("Failed to update user info:", error);
        Alert.alert("Error", "Failed to update information.");
      }
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      const userId = auth.currentUser.uid; // Ensure the user is logged in and has a UID
      const userDocRef = doc(db, "users", userId);

      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        const data = doc.data();
        if (data) {
          setFullName(data.fullName || "Name not found");
          setUsername(data.username || "Username not found");
          setEmail(data.email || "Email not found");
          setphoneNumber(data.phoneNumber || "Phone number not found");
          const pictureSource =
            data.profilePicture ||
            require("../assets/images/profile-placeholder.jpg");
          setProfilePicture(pictureSource);
        }
      });

      return () => unsubscribe();
    }
  }, [auth.currentUser]);

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Password reset email sent successfully.");
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      Alert.alert("Failed to send password reset email. Please try again.");
    }
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => navigation.navigate("Login"))
      .catch((error) => console.error("Sign out error:", error));
  };

  const deleteUserFirestoreData = async (userId: string) => {
    const db = getFirestore();
    const collections = [
      "Gyms",
      "IngredientsList",
      "MacroBarcodeScans",
      "data",
      "mealDetails",
      "preferences",
      "progressUpdates",
      "users",
      "workoutDetails",
    ];
    const batch = writeBatch(db);

    collections.forEach((collectionName) => {
      const docRef = doc(db, collectionName, userId);
      batch.delete(docRef);
    });

    await batch.commit(); // Execute the batch delete
  };

  const deleteUserStorageData = async (userId: string) => {
    const storage = getStorage();
    const directories = ["GymEquipment", "profilePictures", "progressUpdates"];

    directories.forEach(async (dir) => {
      const dirRef = ref(storage, `${dir}/${userId}`);
      try {
        const fileList = await listAll(dirRef);
        const deletePromises = fileList.items.map((item) => deleteObject(item));
        await Promise.all(deletePromises);
      } catch (error) {
        console.error(
          `Failed to delete storage contents from ${dir}/${userId}:`,
          error
        );
        throw error; // Rethrow to handle in the main function
      }
    });
  };

  const reauthenticateWithEmailPassword = async () => {
    return new Promise((resolve, reject) => {
      // Prompt the user to enter their email and password for reauthentication
      // You can use a modal or any UI component to collect the user's credentials
      // Here, we're using TextInput for simplicity

      let email = "";
      let password = "";

      // Function to handle reauthentication with email and password
      const handleReauthentication = async () => {
        try {
          // Sign in the user with their email and password
          await signInWithEmailAndPassword(auth, email, password);
          resolve(true); // Resolve with true if reauthentication is successful
        } catch (error) {
          console.error("Reauthentication failed:", error);
          reject(error); // Reject with the error if reauthentication fails
        }
      };

      // Show a modal or UI component to collect the user's email and password
      // For example, using TextInput:
      Alert.prompt(
        "Reauthentication",
        "Please enter your email and password to reauthenticate:",
        [
          {
            text: "Cancel",
            onPress: () => resolve(false), // Resolve with false if the user cancels
            style: "cancel",
          },
          {
            text: "Submit",
            onPress: () => handleReauthentication(),
          },
        ],
        "login-password" // This prompts the user to enter their email and password
      );
    });
  };

  const deleteUserAccount = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "No user found.");
      return;
    }

    // Prompt the user to reauthenticate with email and password
    try {
      const isReauthenticated = await reauthenticateWithEmailPassword();
      if (isReauthenticated) {
        // Proceed with account deletion if reauthentication is successful
        try {
          await deleteUserFirestoreData(user.uid);
          await deleteUserStorageData(user.uid);

          deleteUser(user)
            .then(() => {
              Alert.alert(
                "Account Deleted",
                "Your account has been successfully deleted."
              );
              navigation.navigate("Login");
            })
            .catch((error) => {
              console.error(
                "Error deleting user authentication record:",
                error
              );
              Alert.alert("Error", "Failed to delete user account.");
            });
        } catch (error) {
          console.error("Failed to delete all user data:", error);
          Alert.alert(
            "Error",
            "Deletion failed, some data may not have been deleted."
          );
        }
      } else {
        // Handle reauthentication cancellation or failure
        Alert.alert("Error", "Reauthentication canceled or failed.");
      }
    } catch (error) {
      // Handle reauthentication error
      console.error("Reauthentication failed:", error);
      Alert.alert("Error", "Reauthentication failed.");
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Image
            source={
              typeof profilePicture === "string"
                ? { uri: profilePicture }
                : profilePicture
            }
            style={styles.profileImage}
          />
          <Text style={styles.nameText}>{fullName}</Text>
          <Text style={styles.usernameText}>@{username}</Text>
        </View>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.accountInfo}>
            <Text style={styles.accountboxHeader}>Account Information</Text>
            <View style={styles.accountInfoRow}>
              <Text style={styles.accountInfoHeader}>Name</Text>
              <Text style={styles.accountInfoText}>
                {fullName}{" "}
                <TouchableOpacity
                  onPress={() => {
                    setEditField({ field: "fullName", value: fullName });
                    setEditMode(true);
                  }}
                >
                  <SmallEditIcon />
                </TouchableOpacity>
              </Text>
            </View>
            <View style={styles.accountInfoRow}>
              <Text style={styles.accountInfoHeader}>Username</Text>
              <Text style={styles.accountInfoText}>
                {username}{" "}
                <TouchableOpacity
                  onPress={() => {
                    setEditField({ field: "username", value: username });
                    setEditMode(true);
                  }}
                >
                  <SmallEditIcon />
                </TouchableOpacity>
              </Text>
            </View>
            <View style={styles.accountInfoRow}>
              <Text style={styles.accountInfoHeader}>Email</Text>
              <Text style={styles.accountInfoText}>
                {email}{" "}
                <TouchableOpacity
                  onPress={() => {
                    setEditField({ field: "email", value: email });
                    setEditMode(true);
                  }}
                >
                  <SmallEditIcon />
                </TouchableOpacity>
              </Text>
            </View>
            <View style={styles.accountInfoRow}>
              <Text style={styles.accountInfoHeader}>Phone Number</Text>
              <Text style={styles.accountInfoText}>
                {phoneNumber}{" "}
                <TouchableOpacity
                  onPress={() => {
                    setEditField({ field: "phoneNumber", value: phoneNumber });
                    setEditMode(true);
                  }}
                >
                  <SmallEditIcon />
                </TouchableOpacity>
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <View style={styles.buttonsRow1}>
              <TouchableOpacity
                style={styles.buttonCenter}
                onPress={() => navigation.navigate("WorkoutPlan")}
              >
                <Text style={styles.buttonTextCenter}>View Workouts</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonCenter}
                onPress={() => navigation.navigate("MealPlan")}
              >
                <Text style={styles.buttonTextCenter}>View Meals</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonsRow2}>
              <TouchableOpacity
                style={styles.buttonCenter}
                onPress={() => handleResetPassword()}
              >
                <Text style={styles.buttonTextCenter}>Reset Password</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonCenter}
                onPress={() => handleSignOut()}
              >
                <Text style={styles.buttonTextCenter}>Log Out</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonsRow3}>
              <TouchableOpacity
                style={styles.buttonCenterRed}
                onPress={() => deleteUserAccount()}
              >
                <Text style={styles.buttonTextCenterRed}>DELETE ACCOUNT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={styles.navigation}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("Dashboard")}
          >
            <HomeIcon />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("Workouts")}
          >
            <WorkoutIcon />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("Meals")}
          >
            <MealIcon />
          </TouchableOpacity>

          <View style={styles.navItem}>
            <ProfileIcon />
          </View>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={editMode}
          onRequestClose={() => {
            setEditMode(false);
          }}
        >
          <TouchableOpacity
            style={styles.centeredView}
            activeOpacity={1}
            onPressOut={() => {
              setEditMode(false);
            }}
          >
            <View style={styles.modalContent}>
              <TextInput
                style={styles.input}
                onChangeText={(text) =>
                  setEditField((prev) => ({ ...prev, value: text }))
                }
                value={editField.value}
                placeholder={`Enter new ${editField.field}`}
              />
              <Button title="Save" onPress={handleUpdate} />
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

const ProfileIcon = () => (
  <Svg height="28" width="28" viewBox="0 0 448 512">
    <Path
      d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"
      fill="#9A2CE8"
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
  scrollContainer: {},
  GearContainer: {
    alignItems: "flex-end",
    marginRight: "5%",
    marginTop: "2%",
  },
  header: {
    marginTop: "2%",
    alignItems: "center", // Align items to the center horizontally
    marginBottom: "7%",
    flexDirection: "column", // Stack the children vertically
  },
  GearIcon: {},
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 25,
    marginBottom: 15, // Add some space below the profile image
  },
  headerText: {
    fontSize: 20,
    fontFamily: "SFProRounded-Heavy",
    color: "#fff",
  },
  nameText: {
    fontSize: 16,
    fontFamily: "SFProRounded-Regular",
    color: "#fff",
  },
  usernameText: {
    fontSize: 14,
    fontFamily: "SFProText-Light",
    color: "#fff",
  },
  accountInfo: {
    padding: 20,
    backgroundColor: "#333",
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  accountboxHeader: {
    fontFamily: "SFProRounded-Heavy",
    fontSize: 24,
    color: "#fff",
    marginBottom: 20,
  },
  accountInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  accountInfoHeader: {
    fontFamily: "SFProText-Heavy",
    fontSize: 18,
    color: "#fff",
  },
  accountInfoText: {
    fontFamily: "SFProText-Regular",
    fontSize: 16,
    color: "#fff",
  },
  buttonContainer: {
    flexDirection: "column",
    justifyContent: "space-evenly",
    marginTop: 20,
  },
  buttonsRow1: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: "10%",
  },
  buttonsRow2: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: "10%",
  },
  buttonsRow3: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: "10%",
  },
  buttonCenter: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    height: 100,
    width: "45%",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#fff",
    borderWidth: 2,
    borderStyle: "solid",
  },
  buttonCenterRed: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    height: 100,
    width: "45%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "red",
  },
  buttonTextCenterRed: {
    color: "#000",
    fontFamily: "SFProRounded-Heavy",
    fontSize: 23,
    textAlign: "center",
  },
  buttonTextCenter: {
    color: "#fff",
    fontFamily: "SFProRounded-Regular",
    fontSize: 23,
    textAlign: "center",
  },
  buttonHeader: {
    borderRadius: 10,
    height: 100,
    width: "45%",
    alignItems: "center",
    padding: 10,
    borderColor: "#fff",
    borderWidth: 2,
    borderStyle: "solid",
  },
  buttonTextHeader: {
    color: "#fff",
    fontFamily: "SFProText-Regular",
    fontSize: 20,
    width: "100%",
    textAlign: "center",
    marginBottom: "10%",
  },
  buttonChildtext: {
    color: "#fff",
    fontFamily: "SFProText-Regular",
  },
  buttonChild: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%", // Set the width of the modal content
    backgroundColor: "white",
    borderRadius: 5,
    padding: 20,
    shadowColor: "#fff",
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
    width: 200,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 46,
    borderTopColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
});

export default Profile;
