import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import InputField from "../components/InputField";
import CustomButton from "../components/CustomButton";

import Loginsvg from "../assets/images/icons/login.svg";

import Googlesvg from "../assets/images/icons/google.svg";
import { GoogleSignin, statusCodes  } from "@react-native-google-signin/google-signin";

import Facebooksvg from "../assets/images/icons/facebook.svg";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_AUTH } from "../Firebaseconfig";
import {
  getAuth, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential 
} from "firebase/auth";

import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

import { Settings } from 'react-native-fbsdk-next';



const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const auth = FIREBASE_AUTH;

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const saveLoginState = async () => {
    try {
      await AsyncStorage.setItem("userToken", "loggedIn");
    } catch (error) {
      console.error("Error saving login state:", error);
    }
  };

  const handleForgotPassword = async () => {
    try {
      if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        return;
      }

      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent. Check your email for instructions.");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      alert("Error sending password reset email. Please try again.");
    }
  };

  const Login = async () => {
    setLoading(true);
    try {
      if (!email || !password) {
        alert("All fields are required.");
        setLoading(false);
        return;
      }

      if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        setLoading(false);
        return;
      }

      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
      alert("Login was successful! Check your email!");
      await saveLoginState();
      navigation.navigate("Home");
    } catch (error) {
      console.log("Firebase Authentication Error:", error);

      if (error.code === "auth/invalid-credential") {
        alert(
          "Invalid credentials. Please check your Email or Password and try again."
        );
      } else {
        alert(
          "Login Failed. Please check your Email or Password and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setLoading(true);
  
      if (!LoginManager) {
        throw new Error('Facebook LoginManager not initialized');
      }
    
      // Initialize Facebook SDK if needed
      await Settings.initializeSDK();
        
      // Request login permissions
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
        
      if (result.isCancelled) {
        console.log("User cancelled Facebook login");
        // Just return silently without showing an error alert
        return;
      }
  
      // Get access token
      const data = await AccessToken.getCurrentAccessToken();
        
      if (!data) {
        throw new Error('Something went wrong obtaining access token');
      }
  
      // Create a Firebase credential with the Facebook access token
      const facebookCredential = FacebookAuthProvider.credential(data.accessToken);
  
      // Sign in with the credential
      const response = await signInWithCredential(auth, facebookCredential);
        
      console.log("Facebook Sign-In Success:", response.user);
      await saveLoginState();
      navigation.navigate("Home");
  
    } catch (error) {
      console.error("Facebook Sign-In Error:", error);
      
      // More specific error handling
      if (error.message === 'User cancelled the login process') {
        // Don't show an alert for cancellation
        console.log("User cancelled Facebook login");
      } else if (error.message === 'Facebook LoginManager not initialized') {
        alert("Facebook login is not properly configured. Please try again later.");
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        alert("An account already exists with the same email address but different sign-in credentials. Try signing in a different way.");
      } else if (error.code === 'auth/invalid-credential') {
        alert("The Facebook login credentials are invalid. Please try again.");
      } else {
        // Generic error for other cases
        alert("Something went wrong with Facebook sign-in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Configure Google Sign-In 
      await GoogleSignin.configure({
        webClientId: "320612794855-59ghqt5fllv319mdifppf7is6poippp6.apps.googleusercontent.com",
        offlineAccess: true,
        scopes: ['profile', 'email'],
        forceCodeForRefreshToken: true
      });
  
      // Sign out first to clear previous session
      await GoogleSignin.signOut();
  
      // Ensure Play Services are available
      await GoogleSignin.hasPlayServices({
        showIfNotAvailable: true,
        showPlayServicesUpdateDialog: true
      });
  
      // Perform sign-in with account selection
      const signInResult = await GoogleSignin.signIn({
        prompt: 'select_account'
      });
  
      // Check if signInResult is null or undefined
      if (!signInResult || !signInResult.data || !signInResult.data.idToken) {
        console.log("Sign-in process was cancelled or failed");
        return; // Exit the function
      }
  
      const { data } = signInResult;
  
      const credential = GoogleAuthProvider.credential(
        data.idToken, 
        data.accessToken
      );
  
      const response = await signInWithCredential(auth, credential);
  
      console.log("Google Sign-In Success:", response.user);
      await saveLoginState();
      navigation.navigate("Home");
  
    } catch (error) {
      // Comprehensive error handling
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("Sign-in was cancelled by user");
        // Optionally show a user-friendly message
        // alert("Google sign-in cancelled");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Sign-in is already in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("Play services not available");
        alert("Google Play services is not available");
      } else {
        console.error("Full Google Sign-In Error:", error);
        console.error("Error Name:", error.name);
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
        
        // Generic error message
        alert("Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
    <ScrollView style={{ paddingHorizontal: 25 }}>
      <View style={{ alignItems: "center", backgroundColor: "red" }}>
        <Loginsvg width={100} height={100} />
      </View>
      <Text
        style={{
          fontSize: 28,
          fontWeight: "500",
          color: "#333",
          marginBottom: 30,
        }}
      >
        Login
      </Text>
      <InputField
        label={"Email ID"}
        icon={
          <MaterialIcons
            name="alternate-email"
            size={19}
            color="grey"
            style={{ marginTop: 5, marginRight: 5 }}
          />
        }
        keyboardType="email-address"
        onChangeText={(text) => setEmail(text)}
      />

      <InputField
        label={"Password"}
        icon={
          <Ionicons
            name="lock-closed-outline"
            size={19}
            color="grey"
            style={{ marginTop: 5, marginRight: 5 }}
          />
        }
        inputType="password"
        onChangeText={(text) => setPassword(text)}
      />
      <TouchableOpacity
        onPress={handleForgotPassword}
        style={{ alignItems: "flex-end" }}
      >
        <Text
          style={{ color: "#AD40AF", fontWeight: "700", marginBottom: 25 }}
        >
          Forgot password?{" "}
        </Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <CustomButton label={"Login"} onPress={() => Login()} />
      )}

      <Text style={{ textAlign: "center", color: "#666", marginBottom: 20 }}>
        Or, login with...
      </Text>

      <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
        <TouchableOpacity
          onPress={handleGoogleSignIn}
          style={{
            backgroundColor: "#ddd",
            borderRadius: 10,
            paddingHorizontal: 30,
            paddingVertical: 10,
          }}
        >
          <Googlesvg height={30} width={30} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleFacebookLogin}
          style={{
            backgroundColor: "#ddd",
            borderRadius: 10,
            paddingHorizontal: 30,
            paddingVertical: 10,
          }}
        >
          <Facebooksvg height={30} width={30} />
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginBottom: 30,
          marginTop: 30,
        }}
      >
        <Text style={{ marginRight: 5 }}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("NavSignUp")}>
          <Text style={{ color: "#AD40AF", fontWeight: "700" }}>SignUp</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </SafeAreaView>
);
};

export default LoginScreen;
