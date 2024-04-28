import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { BackIcon } from "../../svgs";

const Settings = ({ navigation }: { navigation: any }) => {
  const settingsOptions = [
    {
      title: "Account",
      onPress: () => navigation.navigate("AccountSettings"),
    },
    {
      title: "Theme",
      onPress: () => navigation.navigate("ThemeSettings"),
    },
    // Add other settings options here
  ];

  const handleSignOut = () => {
    signOut(auth)
      .then(() => navigation.navigate("Login"))
      .catch((error) => console.error("Sign out error:", error));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.backContainer}>
        <TouchableOpacity
          style={styles.BackIcon}
          onPress={() => navigation.goBack()}
        >
          <BackIcon />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.pageHeader}>Settings</Text>
        {settingsOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.option}
            onPress={option.onPress}
          >
            <Text style={styles.optionText}>{option.title}</Text>
            <Text style={styles.optionArrow}>{">"}</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.signOutButtonContainer}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  backContainer: {
    alignItems: "flex-start",
    padding: 16,
  },
  scrollContainer: {},
  BackIcon: {},
  BackContainer: {
    alignItems: "flex-start",
    marginLeft: "5%",
    marginTop: "2%",
  },
  pageHeader: {
    fontSize: 24,
    fontFamily: "SFProRounded-Heavy",
    color: "#fff",
    alignSelf: "center",
    marginBottom: 20,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
  },
  optionText: {
    fontSize: 16,
    color: "#fff",
  },
  optionArrow: {
    fontSize: 16,
    color: "#ccc",
  },
  signOutButtonContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  signOutButton: {
    height: 50,
    marginTop: 20,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
  },
  signOutButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Settings;
