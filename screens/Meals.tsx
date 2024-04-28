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
import { HomeIcon, WorkoutIcon, ProfileIcon } from "../svgs";
import Svg, { Path } from "react-native-svg";
import { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  Dashboard: undefined;
  Workouts: undefined;
  Profile: undefined;
  InputIngredients: undefined;
  MealPlan: undefined;
  MacroChecker: undefined;
};

type MealScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface MealProps {
  navigation: MealScreenNavigationProp;
}

interface ClickableItemProps {
  title: string;
  description: string;
  imageSource: ImageSourcePropType;
  navigation: MealScreenNavigationProp;
  routeName: keyof RootStackParamList;
}

const mealimage = require("../assets/images/mealimage.png");
const scanfood = require("../assets/images/scanfood.png");
const scheduleimage = require("../assets/images/calendar.jpg");

const Meals = ({ navigation }: MealProps) => {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        <ScrollView style={styles.scrollContainer}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.pageTitle}>Meals</Text>
            <Text style={styles.subTitle}>
              Time to <Text style={styles.boldText}>COOK!!</Text>
            </Text>
          </View>
          <View style={styles.ItemContainer}>
            <ClickableItem
              title="Input Ingredients"
              description="Let us create your customized meal plan"
              imageSource={mealimage}
              navigation={navigation}
              routeName="InputIngredients"
            />
            <ClickableItem
              title="Macro Checker"
              description="Scan a picture of your barcodes to view its macros"
              imageSource={scanfood}
              navigation={navigation}
              routeName="MacroChecker"
            />
            <ClickableItem
              title="This Weeks Plan"
              description="View your Meal Plan and recipes! "
              imageSource={scheduleimage}
              navigation={navigation}
              routeName="MealPlan"
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

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("Workouts")}
          >
            <WorkoutIcon />
          </TouchableOpacity>

          <View style={styles.navItem}>
            <MealIcon />
          </View>

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

const MealIcon = () => (
  <Svg height="28" width="28" viewBox="0 0 456 500">
    <Path
      d="M416 0C400 0 288 32 288 176V288c0 35.3 28.7 64 64 64h32V480c0 17.7 14.3 32 32 32s32-14.3 32-32V352 240 32c0-17.7-14.3-32-32-32zM64 16C64 7.8 57.9 1 49.7 .1S34.2 4.6 32.4 12.5L2.1 148.8C.7 155.1 0 161.5 0 167.9c0 45.9 35.1 83.6 80 87.7V480c0 17.7 14.3 32 32 32s32-14.3 32-32V255.6c44.9-4.1 80-41.8 80-87.7c0-6.4-.7-12.8-2.1-19.1L191.6 12.5c-1.8-8-9.3-13.3-17.4-12.4S160 7.8 160 16V150.2c0 5.4-4.4 9.8-9.8 9.8c-5.1 0-9.3-3.9-9.8-9L127.9 14.6C127.2 6.3 120.3 0 112 0s-15.2 6.3-15.9 14.6L83.7 151c-.5 5.1-4.7 9-9.8 9c-5.4 0-9.8-4.4-9.8-9.8V16zm48.3 152l-.3 0-.3 0 .3-.7 .3 .7z"
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

export default Meals;
