import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { HomeIcon, WorkoutIcon, MealIcon, GearIcon } from "../svgs";
import Svg, { Path } from "react-native-svg";
import { useUser } from "../UserContext";

const Profile = ({ navigation }: { navigation: any }) => {
  const { currentUser } = useUser();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState(
    require("../assets/images/profile-placeholder.jpg")
  );

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.displayName || "Name not found");
      setUsername(currentUser.username || "Username-not-found");
      const pictureSource =
        currentUser.photoURL ||
        require("../assets/images/profile-placeholder.jpg");
      setProfilePicture(pictureSource);
    } else {
      console.log("No user found");
    }
  }, [currentUser]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.GearContainer}>
          <TouchableOpacity
            style={styles.GearIcon}
            onPress={() => navigation.navigate("Settings")}
          >
            <GearIcon />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.scrollContainer}>
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
          <View>
            <Text style={styles.DELETE}>TODO</Text>
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
  DELETE: {
    fontSize: 50,
    fontFamily: "SFProRounded-Heavy",
    color: "#fff",
    alignSelf: "center",
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
