// Tarek Chaalan
// Project Completed: May 3, 2024

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Animated,
  Alert,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  // GoogleAuthProvider,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { OpenEyeIcon, ClosedEyeIcon, GoogleIcon, GithubIcon } from "../svgs";
import { StackNavigationProp } from "@react-navigation/stack";
// import {
//   GoogleSignin,
//   statusCodes,
// } from "@react-native-google-signin/google-signin";

interface LoginProps {
  navigation: StackNavigationProp<any, any>;
}

const firestore = getFirestore();

const Login = ({ navigation }: { navigation: any }) => {
  const [password, setPassword] = useState<string>("");
  const [identifier, setidentifier] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const rotateValueHolder = new Animated.Value(0);

  // GoogleSignin.configure({
  //   scopes: ["https://www.googleapis.com/auth/drive.readonly"], // what API you want to access on behalf of the user, default is email and profile
  //   webClientId:
  //     "1067533845800-qk6km2dp49dagcn6b59tqra0a91vsehm.apps.googleusercontent.com", // client ID of type WEB for your server (needed to verify user ID and offline access). Required to get the `idToken` on the user object!
  // });

  // const googlesignIn = async () => {
  //   try {
  //     await GoogleSignin.hasPlayServices();
  //     const { idToken } = await GoogleSignin.signIn();
  //     const googleCredential = GoogleAuthProvider.credential(idToken);
  //     await signInWithCredential(auth, googleCredential);

  //     console.log("User logged in with Google");
  //     navigation.navigate("Dashboard"); // Or wherever you want the user to go after logging in
  //   } catch (error: any) {
  //     if (error.code === statusCodes.SIGN_IN_CANCELLED) {
  //       // User cancelled the login flow
  //       console.log("User cancelled the login flow.");
  //     } else if (error.code === statusCodes.IN_PROGRESS) {
  //       // Operation (e.g., sign in) is in progress already
  //       console.log("Operation (e.g., sign in) is in progress already.");
  //     } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
  //       // Play services not available or outdated
  //       console.log("Play services not available or outdated.");
  //     } else {
  //       // Some other error happened
  //       console.error(error);
  //     }
  //   }
  // };

  const getEmailByUsername = async (
    username: string
  ): Promise<string | null> => {
    const usersRef = collection(firestore, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return userDoc.data().email;
    }
    return null;
  };

  const isEmail = (input: string): boolean => {
    return input.includes("@");
  };

  const handleLogin = async (identifier: string) => {
    try {
      let userCredential;
      if (isEmail(identifier)) {
        // Direct email login
        userCredential = await signInWithEmailAndPassword(
          auth,
          identifier,
          password
        );
      } else {
        // Username login, requiring email lookup
        const email = await getEmailByUsername(identifier);
        if (email) {
          userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );
        } else {
          Alert.alert("Error", "Username not found");
          return;
        }
      }

      if (userCredential.user) {
        // console.log("Logged in with identifier:", identifier);
        navigation.navigate("Dashboard");
      }
    } catch (error) {
      // console.error(error);
      Alert.alert(
        "Login Failed",
        "Please check your credentials and try again."
      );
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

  return (
    <KeyboardAvoidingView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>FitFuel</Text>
        <Text style={styles.subtitle}>Achieve your fitness goals</Text>
      </View>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.inputContainer}>
          <View style={styles.inputFieldContainer}>
            <TextInput
              placeholder="Email or Username"
              value={identifier}
              onChangeText={(text) => setidentifier(text)}
              placeholderTextColor="#aaaaaa"
              style={styles.input}
            />
          </View>
          <View style={styles.inputFieldContainer}>
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={(text) => setPassword(text)}
              placeholderTextColor="#aaaaaa"
              secureTextEntry={!passwordVisible}
              key={passwordVisible ? "hidden" : "visible"} // Add this line
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
          <TouchableOpacity>
            <Text
              style={styles.forgotPassword}
              onPress={() => navigation.navigate("Forgot")}
            >
              Forgot your Password?
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => handleLogin(identifier)}
          style={styles.loginButton}
        >
          <Text style={styles.loginButtonText}>Log in</Text>
        </TouchableOpacity>
        {/* <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.line} />
        </View>
        <View style={styles.LIW}>
          <Text style={styles.LIWText}>Login with</Text>
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
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>New User?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.signupLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const screenHeight = Dimensions.get("window").height;
const logoSizeFactor = 0.18;
const styles = StyleSheet.create({
  scrollContainer: {
    width: "85%",
    marginTop: "3%",
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
  logo: {
    marginTop: screenHeight * 0.08, // 20% of screen height
    width: screenHeight * logoSizeFactor,
    height: screenHeight * logoSizeFactor,
    marginBottom: screenHeight * 0.02, // 10% of screen height
  },
  title: {
    fontSize: 48,
    fontFamily: "SFProRounded-Heavy",
    color: "#fff",
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "SFProText-Light",
    color: "#aaa",
    marginBottom: "10%",
  },
  inputContainer: {
    width: "100%",
  },
  inputFieldContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#333",
    borderRadius: 20,
    color: "#fff",
    height: 50,
    fontSize: 16,
    fontFamily: "SFProText-Regular",
    paddingHorizontal: 20,
    paddingVertical: 5,
    opacity: 0.8,
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
  forgotPassword: {
    color: "#fff",
    fontFamily: "SFProText-Light",
    alignSelf: "flex-end",
    opacity: 0.5,
    marginRight: 5,
    marginTop: -10,
    marginBottom: "5%",
  },
  loginButton: {
    width: "50%",
    height: 50,
    backgroundColor: "#9A2CE8",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 5,
    opacity: 0.8,
    marginTop: 25,
    marginBottom: 10,
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 24,
    fontFamily: "SFProRounded-Heavy",
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#333",
  },
  orText: {
    width: "7%",
    textAlign: "center",
    color: "#fff",
    fontFamily: "SFProText-Heavy",
  },
  LIW: {
    alignItems: "center",
    marginBottom: "5%",
  },
  LIWText: {
    color: "#fff",
    fontSize: 26,
    fontFamily: "SFProText-Heavy",
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
    fontFamily: "SFProRounded-Heavy",
  },
  GithubButtonText: {
    color: "#000",
    marginLeft: 15,
    fontSize: 17,
    fontFamily: "SFProRounded-Heavy",
  },
  signupContainer: {
    marginTop: "10%",
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
  },
  signupText: {
    color: "#aaa",
    fontFamily: "SFProText-Light",
  },
  signupLink: {
    color: "#fff",
    textDecorationLine: "underline",
    fontFamily: "SFProRounded-Heavy",
    marginLeft: 5,
  },
});

export default Login;
