import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { themes } from "./themes";

const ThemeSettings = ({ navigation }: { navigation: any }) => {
  const ThemeOption = ({ themeName, theme }: any) => (
    <TouchableOpacity
      style={styles.option}
      onPress={() => console.log(`Switch to ${themeName} theme`)}
    >
      <Text style={[styles.text, { color: theme.textColor }]}>{themeName}</Text>
      <View
        style={[styles.colorBox, { backgroundColor: theme.backgroundColor }]}
      >
        <View
          style={[styles.innerBox, { backgroundColor: theme.primaryColor }]}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {Object.entries(themes).map(([key, value]) => (
        <ThemeOption
          key={key}
          themeName={key.charAt(0).toUpperCase() + key.slice(1)}
          theme={value}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#000",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  colorBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  innerBox: {
    width: 30,
    height: 30,
  },
});

export default ThemeSettings;
