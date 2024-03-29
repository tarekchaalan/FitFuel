import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import {sendPasswordResetEmail} from 'firebase/auth';
import {auth} from '../firebase'; // Make sure the path matches your project structure
import Svg, {Path} from 'react-native-svg';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const Forgot = ({navigation}: {navigation: any}) => {
  const [email, setEmail] = useState('');

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Password reset email sent successfully.');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      Alert.alert('Failed to send password reset email. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>FitFuel</Text>
        <Text style={styles.subtitle}>Reset Your Password</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Enter your email address"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#aaaaaa"
          style={styles.input}
        />
        <TouchableOpacity
          onPress={handleResetPassword}
          style={styles.resetButton}>
          <Text style={styles.resetButtonText}>Send Reset Link</Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.checkJunk}> Check Spam & Junk Folders </Text>
      </View>
      <View style={styles.backToLoginContainer}>
        <Text style={styles.backToText}>Back to</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.LoginLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: screenHeight * 0.1,
  },
  logo: {
    width: screenHeight * 0.18,
    height: screenHeight * 0.18,
  },
  title: {
    fontSize: 48,
    color: "#fff",
    fontFamily: "SFProRounded-Heavy",
    marginTop: 20,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: "#aaa",
    fontFamily: "SFProText-Light",
  },
  inputContainer: {
    width: "85%",
    marginTop: 15,
  },
  input: {
    backgroundColor: "#333",
    borderRadius: 20,
    color: "#fff",
    height: 50,
    fontSize: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  resetButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#9A2CE8",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "SFProRounded-Regular",
  },
  checkJunk: {
    color: "#aaa",
    fontFamily: "SFProText-Ultralight",
    marginBottom: 20,
    marginTop: 5,
  },
  backToLoginContainer: {
    flexDirection: "row",
    marginBottom: 20,
    marginTop: "70%",
  },
  backToText: {
    color: "#aaa",
    fontFamily: "SFProText-Light",
  },
  LoginLink: {
    color: "#fff",
    textDecorationLine: "underline",
    fontFamily: "SFProRounded-Heavy",
    marginLeft: 5,
  },
});

export default Forgot;
