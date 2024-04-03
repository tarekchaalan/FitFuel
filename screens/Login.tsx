import React, { useEffect, useState } from "react";
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
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Svg, { Path, Circle } from "react-native-svg";
import { StackNavigationProp } from "@react-navigation/stack";

interface LoginProps {
  navigation: StackNavigationProp<any, any>;
}

const firestore = getFirestore();

const Login: React.FC<LoginProps> = ({ navigation }) => {
  const [password, setPassword] = useState<string>("");
  const [identifier, setidentifier] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const rotateValueHolder = new Animated.Value(0);

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
        console.log("Logged in with identifier:", identifier);
        navigation.navigate("Dashboard");
      }
    } catch (error) {
      console.error(error);
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
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>FitFuel</Text>
        <Text style={styles.subtitle}>Achieve your fitness goals</Text>
      </View>
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
      <View style={styles.orContainer}>
        <View style={styles.line} />
        <Text style={styles.orText}>or</Text>
        <View style={styles.line} />
      </View>
      <View style={styles.LIW}>
        <Text style={styles.LIWText}>Login with</Text>
      </View>
      <View style={styles.socialLoginContainer}>
        <TouchableOpacity style={styles.GoogleButton}>
          <GoogleIcon />
          <Text style={styles.GoogleButtonText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.GithubButton}>
          <GithubIcon />
          <Text style={styles.GithubButtonText}>Github</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>New User?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.signupLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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

const screenHeight = Dimensions.get("window").height;
const logoSizeFactor = 0.18;
const styles = StyleSheet.create({
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
    width: "85%",
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
    width: "85%",
    height: 50,
    backgroundColor: "#9A2CE8",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 5,
    opacity: 0.8,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center", // Center the text horizontally
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
  },
  LIW: {
    alignItems: "center",
    marginBottom: "5%",
  },
  LIWText: {
    color: "#fff",
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
  signupContainer: {
    flexDirection: "row",
    marginBottom: 20,
    marginTop: "10%",
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
