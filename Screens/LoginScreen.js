import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import InputField from "../components/InputField";
import CustomButton from "../components/CustomButton";

import Loginsvg from "../assets/images/icons/login.svg";

import Googlesvg from "../assets/images/icons/google.svg";
import Facebooksvg from "../assets/images/icons/facebook.svg";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_AUTH } from "../Firebaseconfig";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup
} from "firebase/auth";

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
      await saveLoginState(); // Save login state
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

        <View style={{ flexDirection: "row", justifyContent: 'space-evenly' }}>
          <TouchableOpacity
            onPress={() => {}}
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
            onPress={() => {}}
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
