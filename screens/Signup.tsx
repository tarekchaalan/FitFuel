import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
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
import {
  OpenEyeIcon,
  ClosedEyeIcon,
  UploadPFPIcon,
  GoogleIcon,
  GithubIcon,
} from "../svgs";
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
  );
};

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
