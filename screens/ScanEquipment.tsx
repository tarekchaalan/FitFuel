import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {Svg, Path} from 'react-native-svg';
import {
  launchCamera,
  CameraOptions,
  launchImageLibrary,
  ImageLibraryOptions,
} from 'react-native-image-picker';

const BackIcon = () => (
  <Svg height="28" width="28" viewBox="0 0 456 600">
    <Path
      d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"
      fill="#fff"
    />
  </Svg>
);

const ResultsIcon = () => (
  <Svg height="28" width="28" viewBox="0 0 384 512">
    <Path
      d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM80 64h64c8.8 0 16 7.2 16 16s-7.2 16-16 16H80c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64h64c8.8 0 16 7.2 16 16s-7.2 16-16 16H80c-8.8 0-16-7.2-16-16s7.2-16 16-16zm16 96H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V256c0-17.7 14.3-32 32-32zm0 32v64H288V256H96zM240 416h64c8.8 0 16 7.2 16 16s-7.2 16-16 16H240c-8.8 0-16-7.2-16-16s7.2-16 16-16z"
      fill="#fff"
    />
  </Svg>
);

const ScanEquipment = ({navigation}: {navigation: any}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleCameraLaunch = () => {
    const options: CameraOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorMessage) {
        console.log('Camera Error: ', response.errorMessage);
      } else {
        const imageUri = response.assets?.[0]?.uri ?? null;
        // Here, you should handle how you want to store/use the imageUri
        console.log(imageUri);
        setModalVisible(false);
      }
    });
  };

  const pickImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('Image picker error: ', response.errorMessage);
      } else {
        const imageUri = response.assets?.[0]?.uri ?? null;
        // Similarly, handle the imageUri for your use case
        console.log(imageUri);
        setModalVisible(false);
      }
    });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.IconsContainer}>
          <TouchableOpacity
            style={styles.BackIcon}
            onPress={() => navigation.navigate('Workout')}>
            <BackIcon />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ResultsIcon}
            onPress={() => navigation.navigate('EquipmentResult')}>
            <ResultsIcon />
          </TouchableOpacity>
        </View>
        <View>
          <Text style={styles.pageHeader}>Scan Equipment</Text>
        </View>
        <View style={styles.scanButton}>
          <TouchableOpacity style={styles.button} onPress={handleCameraLaunch}>
            <Text style={styles.textStyle}>Use Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.textStyle}>Open Photos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
  },
  IconsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: "5%",
    marginRight: "5%",
    marginTop: "2%",
  },
  BackIcon: {},
  ResultsIcon: {},
  pageHeader: {
    fontSize: 20,
    fontFamily: "SFProRounded-Heavy",
    color: "#fff",
    alignSelf: "center",
  },
  scanButton: {
    padding: 10,
    backgroundColor: "#333",
    borderRadius: 20,
    top: "2%",
    height: "95%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    borderRadius: 20,
    width: "80%",
    padding: 10,
    elevation: 2,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  textStyle: {
    color: "black",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ScanEquipment;
