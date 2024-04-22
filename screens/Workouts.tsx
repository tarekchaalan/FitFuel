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
  ImageSourcePropType,
} from "react-native";
import { HomeIcon, MealIcon, ProfileIcon } from "../svgs";
import Svg, { Path } from "react-native-svg";
import { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  Dashboard: undefined;
  Meals: undefined;
  Profile: undefined;
  ScanEquipment: undefined;
  WorkoutSchedule: undefined;
};

type WorkoutsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface WorkoutsProps {
  navigation: WorkoutsScreenNavigationProp;
}

interface ClickableItemProps {
  title: string;
  description: string;
  imageSource: ImageSourcePropType;
  navigation: WorkoutsScreenNavigationProp;
  routeName: keyof RootStackParamList;
}

const gymimage = require("../assets/images/workout.jpg");
const scheduleimage = require("../assets/images/calendar.jpg");

const Workouts = ({ navigation }: WorkoutsProps) => {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        <ScrollView style={styles.scrollContainer}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.pageTitle}>Workouts</Text>
            <Text style={styles.subTitle}>
              Get up & <Text style={styles.boldText}>WORKOUT!!</Text>
            </Text>
          </View>
          <View style={styles.ItemContainer}>
            <ClickableItem
              title="Scan Equipment (Private Gyms)"
              description="Let us create your customized workout plan"
              imageSource={gymimage}
              navigation={navigation}
              routeName="ScanEquipment"
            />
            <ClickableItem
              title="This Weeks Plan"
              description="View your workouts in a day-to-day format"
              imageSource={scheduleimage}
              navigation={navigation}
              routeName="WorkoutSchedule"
            />
          </View>
        </ScrollView>

        <View style={styles.navigation}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("Dashboard")}
          >
            <HomeIcon />
          </TouchableOpacity>

          <View style={styles.navItem}>
            <WorkoutIcon />
          </View>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("Meals")}
          >
            <MealIcon />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("Profile")}
          >
            <ProfileIcon />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const ClickableItem = ({
  title,
  description,
  imageSource,
  navigation,
  routeName,
}: ClickableItemProps) => {
  return (
    <TouchableOpacity
      style={styles.ClickableItem}
      onPress={() => navigation.navigate(routeName)}
    >
      <Image style={styles.ItemImage} source={imageSource} />
      <View style={styles.overlay}>
        <Text style={styles.ItemTitle}>{title}</Text>
        <Text style={styles.ItemDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
};

const WorkoutIcon = () => (
  <Svg height="40" width="40" viewBox="0 0 50 630">
    <Path
      transform="rotate(45 8.5 8.5)"
      d="M55.465,123.228c-15.547,0-28.159,12.608-28.159,28.161v56.673C11.653,211.908,0,225.928,0,242.765 c0,16.842,11.652,30.861,27.306,34.707v56.666c0,15.555,12.612,28.16,28.159,28.16c15.546,0,28.16-12.605,28.16-28.16V151.389 C83.625,135.837,71.011,123.228,55.465,123.228z"
      fill="#9A2CE8"
    />
    <Path
      transform="rotate(45 8.5 8.5)"
      d="M334.498,65.278c-23.092,0-41.811,18.719-41.811,41.812v93.864h-12.801h-60.585h-19.625l-6.827-0.163V107.09 c0-23.092-18.72-41.812-41.813-41.812c-23.091,0-41.812,18.719-41.812,41.812v271.355c0,23.093,18.721,41.812,41.812,41.812 c23.094,0,41.813-18.719,41.813-41.812v-93.653c0,0,4.501-0.211,6.827-0.211h19.625h60.585h12.801v93.864 c0,23.093,18.719,41.812,41.811,41.812c23.094,0,41.812-18.719,41.812-41.812V107.089 C376.311,83.998,357.592,65.278,334.498,65.278z"
      fill="#9A2CE8"
    />
    <Path
      transform="rotate(45 8.5 8.5)"
      d="M458.229,208.062v-56.673c0-15.552-12.613-28.161-28.158-28.161c-15.547,0-28.16,12.608-28.16,28.161v182.749 c0,15.555,12.613,28.16,28.16,28.16c15.545,0,28.158-12.605,28.158-28.16v-56.666c15.654-3.846,27.307-17.865,27.307-34.707 C485.535,225.927,473.883,211.908,458.229,208.062z"
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
  headerTextContainer: {},
  ItemContainer: {},
  pageTitle: {
    fontSize: 36,
    marginTop: "6%",
    alignSelf: "center",
    fontFamily: "SFProRounded-Heavy",
    color: "#fff",
  },
  subTitle: {
    fontSize: 14,
    marginTop: "2%",
    alignSelf: "center",
    fontFamily: "SFProText-Light",
    color: "#fff",
    marginBottom: "5%",
  },
  boldText: {
    fontFamily: "SFProText-Heavy",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(52, 52, 52, 1)",
    padding: 10,
    marginTop: 110,
    borderRadius: 10,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  ClickableItem: {
    width: "88%",
    height: 180,
    backgroundColor: "#444",
    borderRadius: 20,
    marginLeft: "6%",
    marginTop: 10,
    marginBottom: 30,
    overflow: "hidden",
  },
  ItemImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  ItemTitle: {
    color: "#fff",
    fontSize: 17,
    alignSelf: "flex-start",
    fontFamily: "SFProRounded-Regular",
    marginLeft: "1%",
  },
  ItemDescription: {
    color: "#fff",
    fontSize: 13,
    alignSelf: "flex-start",
    marginLeft: "1%",
    fontFamily: "SFProText-Light",
    marginTop: "1.5%",
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

export default Workouts;
