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
import Svg, { Path } from "react-native-svg";
import { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  Dashboard: undefined;
  Workouts: undefined;
  Profile: undefined;
  ScanIngredients: undefined;
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
              title="Scan Ingredients"
              description="Let us create your customized meal plan"
              imageSource={mealimage}
              navigation={navigation}
              routeName="ScanIngredients"
            />
            <ClickableItem
              title="Macro Checker"
              description="Snap a picture of your food/barcodes to view its macros"
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

const HomeIcon = () => (
  <Svg height="28" width="28" viewBox="0 0 56 56">
    <Path
      d="M .6249 27.8242 C .6249 28.9492 1.5155 29.6289 2.6171 29.6289 C 3.2968 29.6289 3.8358 29.3008 4.3046 28.8320 L 27.1796 7.9961 C 27.4374 7.7383 27.7187 7.6445 28.0233 7.6445 C 28.3046 7.6445 28.5624 7.7383 28.8436 7.9961 L 51.6954 28.8320 C 52.1874 29.3008 52.7264 29.6289 53.3826 29.6289 C 54.4842 29.6289 55.3751 28.9492 55.3751 27.8242 C 55.3751 27.1211 55.1173 26.6758 54.6719 26.2774 L 46.5623 18.8945 L 46.5623 5.0430 C 46.5623 4.0117 45.9061 3.3555 44.8751 3.3555 L 41.8046 3.3555 C 40.7968 3.3555 40.0936 4.0117 40.0936 5.0430 L 40.0936 13.0117 L 30.8124 4.5274 C 29.9921 3.7539 28.9843 3.3789 27.9999 3.3789 C 27.0155 3.3789 26.0312 3.7539 25.1874 4.5274 L 1.3280 26.2774 C .9062 26.6758 .6249 27.1211 .6249 27.8242 Z M 7.3280 47.4883 C 7.3280 50.7461 9.2968 52.6445 12.6015 52.6445 L 22.0936 52.6445 L 22.0936 35.9805 C 22.0936 34.9023 22.8202 34.1992 23.8984 34.1992 L 32.1718 34.1992 C 33.2499 34.1992 33.9531 34.9023 33.9531 35.9805 L 33.9531 52.6445 L 43.4216 52.6445 C 46.7264 52.6445 48.6719 50.7461 48.6719 47.4883 L 48.6719 30.3320 L 28.7734 12.4023 C 28.5155 12.1679 28.2343 12.0508 27.9531 12.0508 C 27.6952 12.0508 27.4374 12.1679 27.1562 12.4258 L 7.3280 30.4492 Z"
      fill="#fff"
    />
  </Svg>
);

const WorkoutIcon = () => (
  <Svg height="40" width="40" viewBox="0 0 50 630">
    <Path
      transform="rotate(45 8.5 8.5)"
      d="M55.465,123.228c-15.547,0-28.159,12.608-28.159,28.161v56.673C11.653,211.908,0,225.928,0,242.765 c0,16.842,11.652,30.861,27.306,34.707v56.666c0,15.555,12.612,28.16,28.159,28.16c15.546,0,28.16-12.605,28.16-28.16V151.389 C83.625,135.837,71.011,123.228,55.465,123.228z"
      fill="#fff"
    />
    <Path
      transform="rotate(45 8.5 8.5)"
      d="M334.498,65.278c-23.092,0-41.811,18.719-41.811,41.812v93.864h-12.801h-60.585h-19.625l-6.827-0.163V107.09 c0-23.092-18.72-41.812-41.813-41.812c-23.091,0-41.812,18.719-41.812,41.812v271.355c0,23.093,18.721,41.812,41.812,41.812 c23.094,0,41.813-18.719,41.813-41.812v-93.653c0,0,4.501-0.211,6.827-0.211h19.625h60.585h12.801v93.864 c0,23.093,18.719,41.812,41.811,41.812c23.094,0,41.812-18.719,41.812-41.812V107.089 C376.311,83.998,357.592,65.278,334.498,65.278z"
      fill="#fff"
    />
    <Path
      transform="rotate(45 8.5 8.5)"
      d="M458.229,208.062v-56.673c0-15.552-12.613-28.161-28.158-28.161c-15.547,0-28.16,12.608-28.16,28.161v182.749 c0,15.555,12.613,28.16,28.16,28.16c15.545,0,28.158-12.605,28.158-28.16v-56.666c15.654-3.846,27.307-17.865,27.307-34.707 C485.535,225.927,473.883,211.908,458.229,208.062z"
      fill="#fff"
    />
  </Svg>
);

const MealIcon = () => (
  <Svg height="28" width="28" viewBox="0 0 456 500">
    <Path
      d="M416 0C400 0 288 32 288 176V288c0 35.3 28.7 64 64 64h32V480c0 17.7 14.3 32 32 32s32-14.3 32-32V352 240 32c0-17.7-14.3-32-32-32zM64 16C64 7.8 57.9 1 49.7 .1S34.2 4.6 32.4 12.5L2.1 148.8C.7 155.1 0 161.5 0 167.9c0 45.9 35.1 83.6 80 87.7V480c0 17.7 14.3 32 32 32s32-14.3 32-32V255.6c44.9-4.1 80-41.8 80-87.7c0-6.4-.7-12.8-2.1-19.1L191.6 12.5c-1.8-8-9.3-13.3-17.4-12.4S160 7.8 160 16V150.2c0 5.4-4.4 9.8-9.8 9.8c-5.1 0-9.3-3.9-9.8-9L127.9 14.6C127.2 6.3 120.3 0 112 0s-15.2 6.3-15.9 14.6L83.7 151c-.5 5.1-4.7 9-9.8 9c-5.4 0-9.8-4.4-9.8-9.8V16zm48.3 152l-.3 0-.3 0 .3-.7 .3 .7z"
      fill="#9A2CE8"
    />
  </Svg>
);

const ProfileIcon = () => (
  <Svg height="28" width="28" viewBox="0 0 448 512">
    <Path
      d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"
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
  scrollContainer: {},
  headerTextContainer: {},
  ItemContainer: {},
  pageTitle: {
    fontSize: 20,
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
    marginBottom: "10%",
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
