import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import InputField from "../components/InputField";
import CustomButton from "../components/CustomButton";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import Googlesvg from "../assets/images/icons/google.svg";
import Facebooksvg from "../assets/images/icons/facebook.svg";

import { FIREBASE_AUTH, FIREBASE_DB } from "../Firebaseconfig";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInAnonymously,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";

import { setDoc, doc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { encryptData } from "../services/encryption";

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

const firestore = FIREBASE_DB;

const SignupScreen = ({ navigation }) => {
  const saveLoginState = async () => {
    try {
      await AsyncStorage.setItem("userToken", "loggedIn");
    } catch (error) {
      console.error("Error saving login state:", error);
    }
  };

  useEffect(() => {
    if (Platform.OS === "web") {
      getRedirectResult(FIREBASE_AUTH)
        .then(async (result) => {
          if (result && result.user) {
            console.log("Redirect login success:", result.user);
            await saveLoginState();
            navigation.navigate("Home");
          }
        })
        .catch((err) => {
          console.error("Redirect auth error:", err);
        });
    }
  }, []);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const [selectedDate, setSelectedDate] = useState("Date of Birth");

  const handleConfirm = (date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const auth = FIREBASE_AUTH;

  const isValidEmail = (email) => {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const SignUp = async () => {
    setLoading(true);
    try {
      if (!fullName || !email || !password || !confirmPassword) {
        alert("All fields are required.");
        setLoading(false);
        return;
      }

      if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        alert("Password and Confirm Password must match.");
        setLoading(false);
        return;
      }

      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Send email verification
      await sendEmailVerification(auth.currentUser);

      const userDocRef = doc(firestore, "users", response.user.uid);
      const rawDob =
        selectedDate instanceof Date
          ? selectedDate.toDateString()
          : selectedDate;

      // Add user data to Firestore with sensitive personal info securely encrypted
      await setDoc(userDocRef, {
        fullName,
        email,
        dateOfBirth: encryptData(rawDob, response.user.uid),
        isEncrypted: true,
        createdAt: new Date().toISOString(),
      });

      console.log(response);
      alert(
        "You have successfully created an account! Please check your email for verification."
      );

      await saveLoginState();
      navigation.navigate("NavLogin");
    } catch (error) {
      console.log(error);

      if (error.code === "auth/email-already-in-use") {
        alert("Email is already in use. Please use a different email");
      } else if (error.code === "auth/weak-password") {
        alert("Password is too weak. Please use a stronger password");
      } else if (error.code === "auth/invalid-email") {
        alert("Please enter a valid email address.");
      } else {
        alert("SignUp Failed: " + error.message);
      }
    } finally {
      setLoading(false);
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
  const handleFacebookLogin = async () => {
    try {
      setLoading(true);

      if (Platform.OS === "web") {
        const provider = new FacebookAuthProvider();
        try {
          const response = await signInWithPopup(auth, provider);
          console.log("Facebook Web Sign-In Success:", response.user);
          await saveLoginState();
          navigation.navigate("Home");
          return;
        } catch (popupErr) {
          if (
            popupErr.code === "auth/popup-blocked" ||
            popupErr.code === "auth/cancelled-popup-request"
          ) {
            console.log("Popup blocked, redirecting...");
            await signInWithRedirect(auth, provider);
            return;
          }
          throw popupErr;
        }
      }

      if (!LoginManager) {
        alert(
          "Facebook Sign-In requires a standalone Android APK build (EAS build). In Expo Go, please sign in with Email & Password or tap 'Continue as Guest'."
        );
        return;
      }

      await Settings?.initializeSDK?.();

      const result = await LoginManager.logInWithPermissions([
        "public_profile",
        "email",
      ]);

      if (result.isCancelled) {
        console.log("User cancelled Facebook login");
        return;
      }

      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        throw new Error("Something went wrong obtaining access token");
      }

      const facebookCredential = FacebookAuthProvider.credential(
        data.accessToken
      );
      await signInWithCredential(auth, facebookCredential);
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
        try {
          const response = await signInWithPopup(auth, provider);
          console.log("Google Web Sign-In Success:", response.user);
          await saveLoginState();
          navigation.navigate("Home");
          return;
        } catch (popupErr) {
          if (
            popupErr.code === "auth/popup-blocked" ||
            popupErr.code === "auth/cancelled-popup-request"
          ) {
            console.log("Popup blocked, redirecting...");
            await signInWithRedirect(auth, provider);
            return;
          }
          throw popupErr;
        }
      }

      if (!GoogleSignin) {
        alert(
          "Google Sign-In on mobile requires a standalone Android APK build (EAS build). In Expo Go, please sign in with Email & Password or tap 'Continue as Guest'."
        );
        return;
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
      await signInWithCredential(auth, credential);
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
            marginBottom: 20,
            textAlign:'center'
          }}
        >
          SignUp
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginBottom: 10 }}>
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            style={{
              backgroundColor: "#ddd",
              borderRadius: 10,
              paddingHorizontal: 25,
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
              paddingHorizontal: 25,
              paddingVertical: 10,
            }}
          >
            <Facebooksvg height={30} width={30} />
          </TouchableOpacity>
        </View>

        <Text style={{ textAlign: "center", color: "#666", marginBottom: 20 }}>
          Or SignUP with your Email
        </Text>

        <InputField
          label={"Full Name"}
          icon={
            <Ionicons
              name="person-outline"
              size={19}
              color="grey"
              style={{ marginTop: 5, marginRight: 5 }}
            />
          }
          onChangeText={(text) => setFullName(text)}
        />

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
          label={"Password (Minimum of 6 characters)"}
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

        <InputField
          label={"Confirm Password"}
          icon={
            <Ionicons
              name="lock-closed-outline"
              size={19}
              color="grey"
              style={{ marginTop: 5, marginRight: 5 }}
            />
          }
          inputType="password"
          onChangeText={(text) => setConfirmPassword(text)}
        />

        {Platform.OS === "web" ? (
          <View
            style={{
              flexDirection: "row",
              borderBottomColor: "#ccc",
              borderBottomWidth: 1,
              paddingBottom: 8,
              marginBottom: 30,
              alignItems: "center",
            }}
          >
            <Ionicons
              name="calendar-outline"
              size={19}
              color="grey"
              style={{ marginTop: 5, marginRight: 8 }}
            />
            <input
              type="date"
              max="2010-01-01"
              min="1920-01-01"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 16,
                color: "#333",
                fontFamily: "inherit",
                flex: 1,
              }}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(new Date(e.target.value));
                }
              }}
            />
          </View>
        ) : (
          <>
            <View
              style={{
                flexDirection: "row",
                borderBottomColor: "#ccc",
                borderBottomWidth: 1,
                paddingBottom: 8,
                marginBottom: 30,
              }}
            >
              <Ionicons
                name="calendar-outline"
                size={19}
                color="grey"
                style={{ marginTop: 5, marginRight: 5 }}
              />

              <TouchableOpacity onPress={showDatePicker}>
                <Text style={{ color: "#666", marginLeft: 5, marginTop: 5 }}>
                  {selectedDate instanceof Date
                    ? selectedDate.toDateString()
                    : selectedDate}
                </Text>
              </TouchableOpacity>
            </View>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              maximumDate={new Date("2010-01-01")}
              minimumDate={new Date("1923-01-01")}
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
            />
          </>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <CustomButton label={"SignUp"} onPress={() => SignUp()} />
        )}

        <TouchableOpacity
          onPress={handleGuestLogin}
          disabled={loading}
          style={{
            backgroundColor: "#2E2787",
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            marginTop: 15,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.2)",
          }}
        >
          <Text style={{ color: "#F0F8FF", fontWeight: "bold", fontSize: 15 }}>
            Continue as Guest (Skip Sign Up)
          </Text>
        </TouchableOpacity>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 30,
            marginTop: 20,
          }}
        >
          <Text style={{ marginRight: 5 }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("NavLogin")}>
            <Text style={{ color: "#041E42", fontWeight: "700" }}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignupScreen;
