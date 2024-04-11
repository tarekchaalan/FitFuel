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
import Svg, { Path } from "react-native-svg";

const IngredientsResult = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.BackContainer}>
          <TouchableOpacity
            style={styles.BackIcon}
            onPress={() => navigation.navigate("ScanIngredients")}
          >
            <BackIcon />
          </TouchableOpacity>
        </View>
        <View>
          <Text style={styles.pageHeader}>Inventory (TODO)</Text>
        </View>
      </SafeAreaView>
    </View>
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
});

export default IngredientsResult;
