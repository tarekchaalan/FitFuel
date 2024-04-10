import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Animated,
  Alert,
} from "react-native";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  // GoogleAuthProvider,
  // signInWithCredential,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "../firebase";
import CountryPicker from "react-native-country-picker-modal";
import { CountryCode, Country } from "../assets/types";
import { AsYouType } from "libphonenumber-js";
import Svg, { Path, Circle } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
// import {
//   GoogleSignin,
//   statusCodes,
// } from "@react-native-google-signin/google-signin";

const Signup = ({ navigation }: { navigation: any }) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [countryCode, setCountryCode] = useState<CountryCode>("US");
  const [country, setCountry] = useState<Country | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  // const [userInfo, setUserInfo] = useState<any>(null);
  const rotateValueHolder = new Animated.Value(0);

  // GoogleSignin.configure({
  //   scopes: ["https://www.googleapis.com/auth/drive.readonly"], // what API you want to access on behalf of the user, default is email and profile
  //   webClientId:
  //     "1067533845800-qk6km2dp49dagcn6b59tqra0a91vsehm.apps.googleusercontent.com", // client ID of type WEB for your server (needed to verify user ID and offline access). Required to get the `idToken` on the user object!
  // });

  // const googlesignIn = async () => {
  //   try {
  //     const { idToken, user: googleUser } = await GoogleSignin.signIn();
  //     const googleCredential = GoogleAuthProvider.credential(idToken);
  //     const userCredential = await signInWithCredential(auth, googleCredential);
  //     const firebaseUser = userCredential.user; // This is the Firebase Auth user

  //     // Now use firebaseUser.uid (Firebase Auth user ID) to reference the user in Firestore
  //     await setDoc(doc(firestore, "users", firebaseUser.uid), {
  //       fullName: googleUser.givenName + " " + googleUser.familyName,
  //       username: googleUser.givenName,
  //       countryCode: "",
  //       phoneNumber: "",
  //       email: googleUser.email,
  //       profilePicture: googleUser.photo,
  //     });

  //     // After successful signup, navigate to "Preferences" or another appropriate screen
  //     navigation.navigate("Preferences");
  //   } catch (error: any) {
  //     // Handle errors
  //     if (error.code === statusCodes.SIGN_IN_CANCELLED) {
  //       // User cancelled the login flow
  //     } else if (error.code === statusCodes.IN_PROGRESS) {
  //       // Operation (e.g., sign in) is in progress already
  //     } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
  //       // Play services not available or outdated
  //     } else {
  //       // Some other error happened
  //       console.error("Google Sign-In error:", error);
  //     }
  //   }
  // };

  useEffect(() => {
    // Only set the country code to US if it hasn't been selected yet
    if (!countryCode) {
      setCountryCode("US");
    }
  }, [countryCode]);

  const onSelect = (selectedCountry: Country) => {
    setCountryCode(selectedCountry.cca2);
    setCountry(selectedCountry);
  };

  const handlePhoneNumberChange = (text: string) => {
    const formatter = new AsYouType(country ? country.cca2 : "US");
    const formatted = formatter.input(text);
    setPhoneNumber(formatter.getNationalNumber());
    setFormattedPhoneNumber(formatted);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string, userId: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `profilePictures/${userId}`);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const handleSignUp = async () => {
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredentials.user;
      await updateProfile(user, {
        displayName: fullName,
      });
      // Send verification email
      await sendEmailVerification(user, {
        handleCodeInApp: true,
        url: "https://nourishfit-planner.firebaseapp.com", // Make sure this is a whitelisted domain
      });
      // Upload the profile image and get the URL
      let profilePictureUrl = "";
      if (profileImage) {
        profilePictureUrl = await uploadImage(profileImage, user.uid);
        // Update user profile with photoURL
        await updateProfile(user, { photoURL: profilePictureUrl });
      }
      // Save user data, including profile image URL, to Firestore
      await setDoc(doc(firestore, "users", user.uid), {
        fullName: fullName,
        username: username,
        countryCode: countryCode,
        phoneNumber: phoneNumber,
        email: email,
        profilePicture: profilePictureUrl,
      });
      Alert.alert("Verification email sent. Please check your email.");
      // temporary fix to show user data when navigated to app
    } catch (error) {
      const message = (error as Error).message;
      Alert.alert(message);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
    Animated.timing(rotateValueHolder, {
      toValue: passwordVisible ? 0 : 1, // toggle value based on password visibility
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    opacity: rotateValueHolder.interpolate({
      inputRange: [0, 1],
      outputRange: [0.35, 1],
    }),
  };

  const renderCallingCode = () => {
    return (
      <View style={styles.callingCodeContainer}>
        <CountryPicker
          countryCode={countryCode}
          onSelect={onSelect}
          withFilter
          withFlag
          withAlphaFilter
          withEmoji
          containerButtonStyle={styles.countryPickerButton}
        />
        <Text style={styles.callingCodeText}>
          +{country ? country.callingCode[0] : "1"}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <KeyboardAvoidingView style={styles.container} behavior="padding">
        <View style={styles.logoContainer}>
          <Text style={styles.title}>Join Us!</Text>
          <TouchableOpacity onPress={pickImage} style={styles.pfpInput}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }} // Use uri instead of assets
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <UploadPFPIcon />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Full Name"
            value={fullName}
            onChangeText={(text) => setFullName(text)}
            placeholderTextColor="#aaaaaa"
            style={styles.input}
          />
          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={(text) => setUsername(text)}
            placeholderTextColor="#aaaaaa"
            style={styles.input}
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            placeholderTextColor="#aaaaaa"
            style={styles.input}
          />
          <View style={styles.CountryContainer}>
            {renderCallingCode()}
            <TextInput
              placeholder="Phone Number"
              value={formattedPhoneNumber}
              onChangeText={handlePhoneNumberChange} // Correctly hook up the handler here
              placeholderTextColor="#aaaaaa"
              keyboardType="phone-pad"
              style={styles.Numberinput}
            />
          </View>
          <View style={styles.inputFieldContainer}>
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={(text) => setPassword(text)}
              placeholderTextColor="#aaaaaa"
              secureTextEntry={!passwordVisible}
              key={passwordVisible ? "hidden" : "visible"}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.eyeIcon}
            >
              <Animated.View style={animatedStyle}>
                {passwordVisible ? <OpenEyeIcon /> : <ClosedEyeIcon />}
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={handleSignUp} style={styles.SignUpButton}>
          <Text style={styles.SignUpButtonText}>Sign Up</Text>
        </TouchableOpacity>
        {/* <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.line} />
        </View>
        <View style={styles.SUW}>
          <Text style={styles.SUWText}>Signup with</Text>
        </View>
        <View style={styles.socialLoginContainer}>
          <TouchableOpacity style={styles.GoogleButton} onPress={googlesignIn}>
            <GoogleIcon />
            <Text style={styles.GoogleButtonText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.GithubButton}>
            <GithubIcon />
            <Text style={styles.GithubButtonText}>Github</Text>
          </TouchableOpacity>
        </View> */}
        <View style={styles.LoginContainer}>
          <Text style={styles.LoginText}>Already Have an Account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.LoginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

const GoogleIcon = () => (
  <Svg height="30" width="26" viewBox="0 0 488 512">
    <Path
      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
      fill="#000"
    />
  </Svg>
);

const GithubIcon = () => (
  <Svg height="30" width="26" viewBox="0 0 496 512">
    <Path
      d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
      fill="#000"
    />
  </Svg>
);

const UploadPFPIcon = () => (
  <Svg height="25px" width="25px" viewBox="0 0 448 512">
    <Path
      d="M246.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 109.3V320c0 17.7 14.3 32 32 32s32-14.3 32-32V109.3l73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64c0 53 43 96 96 96H352c53 0 96-43 96-96V352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V352z"
      fill="#ffffff"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ClosedEyeIcon = () => (
  <Svg height="20px" width="20px" viewBox="0 0 24 24">
    <Path
      d="M2 10C2 10 5.5 14 12 14C18.5 14 22 10 22 10"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 11.6445L2 14"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 14L20.0039 11.6484"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.91406 13.6797L8 16.5"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15.0625 13.6875L16 16.5"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const OpenEyeIcon = () => (
  <Svg height="20px" width="20px" viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1 12C1 12 5 20 12 20C19 20 23 12 23 12"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx="12"
      cy="12"
      r="3"
      stroke="#fff"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </Svg>
);

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  logoContainer: {
    alignItems: "center",
  },
  pfpInput: {
    width: 100,
    height: 100,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#323232",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "5%",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 23,
  },
  title: {
    fontSize: 26,
    fontFamily: "SFProRounded-Heavy",
    color: "#fff",
    marginTop: "15%",
    marginBottom: "4%",
  },
  inputContainer: {
    width: "85%",
  },
  inputFieldContainer: {},
  input: {
    backgroundColor: "#333",
    borderRadius: 20,
    color: "#ffffff",
    height: 50,
    fontSize: 16,
    paddingHorizontal: 20,
    paddingVertical: 5,
    opacity: 0.8,
    marginBottom: 20,
  },
  CountryContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    opacity: 0.8,
  },
  callingCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  callingCodeText: {
    color: "#ffffff",
    marginLeft: 5,
  },
  countryPickerButton: {},
  Numberinput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 16,
    paddingHorizontal: 2,
    paddingVertical: 5,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 10,
    height: 30,
    width: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  SignUpButton: {
    width: "85%",
    height: 50,
    backgroundColor: "#9A2CE8",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 5,
    opacity: 0.8,
    marginTop: 25,
    marginBottom: 10,
    alignItems: "center", // Align items horizontally in the center
    justifyContent: "center", // Align items vertically in the center
  },
  SignUpButtonText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center", // Center the text horizontally
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#333",
  },
  orText: {
    width: "7%",
    textAlign: "center",
    color: "#ffffff",
  },
  SUW: {
    alignItems: "center",
    marginBottom: "5%",
  },
  SUWText: {
    color: "#ffffff",
    fontSize: 26,
    fontFamily: "SFProText-Regular",
  },
  socialLoginContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  GoogleButton: {
    width: "32%",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 25,
    marginHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  GithubButton: {
    width: "32%",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 25,
    marginHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  GoogleButtonText: {
    color: "#000",
    marginLeft: 15,
    fontSize: 17,
    fontWeight: "bold",
  },
  GithubButtonText: {
    color: "#000",
    marginLeft: 15,
    fontSize: 17,
    fontWeight: "bold",
  },
  LoginContainer: {
    marginTop: "10%",
    flexDirection: "row",
    marginBottom: 20,
  },
  LoginText: {
    color: "#aaaaaa",
    fontFamily: "SFProText-Light",
  },
  LoginLink: {
    color: "#ffffff",
    textDecorationLine: "underline",
    fontFamily: "SFProRounded-Heavy",
    marginLeft: 5,
  },
});

export default Signup;
