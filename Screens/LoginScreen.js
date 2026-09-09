import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import InputField from "../components/InputField";
import CustomButton from "../components/CustomButton";

import Googlesvg from "../assets/images/icons/google.svg";
import Facebooksvg from "../assets/images/icons/facebook.svg";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_AUTH } from "../Firebaseconfig";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signInAnonymously,
} from "firebase/auth";

let GoogleSignin = null;
let statusCodes = null;
let LoginManager = null;
let AccessToken = null;
let Settings = null;

if (Platform.OS !== "web") {
  try {
    const googleModule = require("@react-native-google-signin/google-signin");
    GoogleSignin = googleModule.GoogleSignin;
    statusCodes = googleModule.statusCodes;
  } catch (e) {
    console.log("Native Google Signin not available:", e?.message);
  }
  try {
    const fbModule = require("react-native-fbsdk-next");
    LoginManager = fbModule.LoginManager;
    AccessToken = fbModule.AccessToken;
    Settings = fbModule.Settings;
  } catch (e) {
    console.log("Native Facebook SDK not available:", e?.message);
  }
}

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

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      try {
        await signInAnonymously(auth);
      } catch (authError) {
        console.warn("Firebase anonymous auth fallback:", authError?.message);
      }
      let guestId = await AsyncStorage.getItem("guestUserId");
      if (!guestId) {
        guestId = `guest_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
        await AsyncStorage.setItem("guestUserId", guestId);
      }
      await AsyncStorage.setItem("userToken", "guest");
      navigation.navigate("Home");
    } catch (error) {
      console.error("Guest login fallback:", error);
      await AsyncStorage.setItem("userToken", "guest");
      navigation.navigate("Home");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      const cleanEmail = email.trim();
      if (!isValidEmail(cleanEmail)) {
        alert("Please enter a valid email address to reset password.");
        return;
      }

      await sendPasswordResetEmail(auth, cleanEmail);
      alert("Password reset email sent! Please check your inbox for instructions.");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      alert(error.message || "Error sending password reset email. Please try again.");
    }
  };

  const Login = async () => {
    setLoading(true);
    try {
      const cleanEmail = email.trim();
      if (!cleanEmail || !password) {
        alert("Please enter both your Email and Password.");
        setLoading(false);
        return;
      }

      if (!isValidEmail(cleanEmail)) {
        alert("Please enter a valid email address.");
        setLoading(false);
        return;
      }

      const response = await signInWithEmailAndPassword(auth, cleanEmail, password);
      console.log("Logged in successfully:", response.user?.email);
      await saveLoginState();
      navigation.navigate("Home");
    } catch (error) {
      console.error("Firebase Authentication Error:", error);

      let message = "Login Failed. Please check your credentials.";
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        message =
          "Incorrect email or password.\n\nDon't have an account yet? Tap 'SignUp' below to create one, or tap 'Continue as Guest' to enter immediately without an account.";
      } else if (error.code === "auth/too-many-requests") {
        message =
          "Too many failed login attempts. Please reset your password or wait a few minutes.";
      } else if (error.code === "auth/network-request-failed") {
        message = "Network error. Please check your internet connection.";
      } else if (error.message) {
        message = error.message;
      }

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setLoading(true);

      if (Platform.OS === "web") {
        const provider = new FacebookAuthProvider();
        const response = await signInWithPopup(auth, provider);
        console.log("Facebook Web Sign-In Success:", response.user);
        await saveLoginState();
        navigation.navigate("Home");
        return;
      }

      if (!LoginManager) {
        throw new Error("Facebook LoginManager not initialized");
      }

      // Initialize Facebook SDK if needed
      await Settings?.initializeSDK?.();

      // Request login permissions
      const result = await LoginManager.logInWithPermissions([
        "public_profile",
        "email",
      ]);

      if (result.isCancelled) {
        console.log("User cancelled Facebook login");
        return;
      }

      // Get access token
      const data = await AccessToken.getCurrentAccessToken();

      if (!data) {
        throw new Error("Something went wrong obtaining access token");
      }

      // Create a Firebase credential with the Facebook access token
      const facebookCredential = FacebookAuthProvider.credential(
        data.accessToken
      );

      // Sign in with the credential
      const response = await signInWithCredential(auth, facebookCredential);

      console.log("Facebook Sign-In Success:", response.user);
      await saveLoginState();
      navigation.navigate("Home");
    } catch (error) {
      console.error("Facebook Sign-In Error:", error);

      if (error.code === "auth/popup-closed-by-user") {
        console.log("Facebook popup closed by user");
      } else if (error.message === "User cancelled the login process") {
        console.log("User cancelled Facebook login");
      } else {
        alert("Facebook sign-in: " + (error.message || "Failed. Please try again."));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      if (Platform.OS === "web") {
        const provider = new GoogleAuthProvider();
        const response = await signInWithPopup(auth, provider);
        console.log("Google Web Sign-In Success:", response.user);
        await saveLoginState();
        navigation.navigate("Home");
        return;
      }

      if (!GoogleSignin) {
        throw new Error("Google Sign-In is not configured for this device");
      }

      await GoogleSignin.configure({
        webClientId:
          "320612794855-59ghqt5fllv319mdifppf7is6poippp6.apps.googleusercontent.com",
        offlineAccess: true,
        scopes: ["profile", "email"],
        forceCodeForRefreshToken: true,
      });

      await GoogleSignin.signOut();

      await GoogleSignin.hasPlayServices({
        showIfNotAvailable: true,
        showPlayServicesUpdateDialog: true,
      });

      const signInResult = await GoogleSignin.signIn({
        prompt: "select_account",
      });

      if (!signInResult || !signInResult.data || !signInResult.data.idToken) {
        console.log("Sign-in process was cancelled or failed");
        return;
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
      if (error.code === "auth/popup-closed-by-user") {
        console.log("Google popup closed by user");
      } else if (statusCodes && error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("Sign-in was cancelled by user");
      } else {
        console.error("Google Sign-In Error:", error);
        alert("Google sign-in: " + (error.message || "Failed. Please try again."));
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#f8fafc",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 25,
          paddingVertical: 30,
          width: "100%",
          maxWidth: 440,
          alignSelf: "center",
        }}
        showsVerticalScrollIndicator={false}
      >

        <Text
          style={{
            fontSize: 28,
            fontWeight: "500",
            color: "#333",
            marginBottom: 30,
            textAlign:'center'
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
            style={{ color: "#041E42", fontWeight: "700", marginBottom: 25 }}
          >
            Forgot password?{" "}
          </Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <CustomButton label={"Login"} onPress={() => Login()} />
        )}

        <Text
          style={{ textAlign: "center", color: "#F0F8FF", marginBottom: 20 }}
        >
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

        <TouchableOpacity
          onPress={handleGuestLogin}
          disabled={loading}
          style={{
            backgroundColor: "#2E2787",
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            marginTop: 20,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.2)",
          }}
        >
          <Text style={{ color: "#F0F8FF", fontWeight: "bold", fontSize: 15 }}>
            Continue as Guest (Skip Login)
          </Text>
        </TouchableOpacity>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 30,
            marginTop: 25,
          }}
        >
          <Text style={{ marginRight: 5 }}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("NavSignUp")}>
            <Text style={{ color: "#041E42", fontWeight: "700" }}>SignUp</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
