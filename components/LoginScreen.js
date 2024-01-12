import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import InputField from "./InputField";
import CustomButton from "./CustomButton";
import Loginsvg from "../assets/images/icons/login.svg";
import Googlesvg from "../assets/images/icons/google.svg";
import Facebooksvg from "../assets/images/icons/facebook.svg";
import Twittersvg from "../assets/images/icons/twitter.svg";

import { FIREBASE_AUTH } from "../Firebaseconfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const auth = FIREBASE_AUTH;

  const isValidEmail = (email) => {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const Login = async () => {
    setLoading(true);
    try {
      if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        return;
      }

      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
      alert("Login was succesful! Check your email!");
    } catch (error) {
      console.log("Firebase Authentication Error:", error);

      if (error.code === "auth/user-not-found") {
        alert("Invalid email. Please check your email and try again.");
      } else if (error.code === "auth/wrong-password") {
        alert("Incorrect password. Please try again.");
      } else {

        alert("Login Failed. Please check your credentials and try again.");
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
              name="ios-lock-closed-outline"
              size={19}
              color="grey"
              style={{ marginTop: 5, marginRight: 5 }}
            />
          }
          inputType="password"
          onChangeText={(text) => setPassword(text)}
          fieldButtonLabel={"Forgot password?"}
          fieldButtonFunction={() => {}}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <CustomButton label={"Login"} onPress={() => Login()} />
        )}

        <Text style={{ textAlign: "center", color: "#666", marginBottom: 20 }}>
          Or, login with...
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity
            onPress={() => {}}
            style={{
              backgroundColor: "#ddd",
              borderRadius: 10,
              paddingHorizontal: 30,
              paddingVertical: 10,
            }}
          >
            <Googlesvg height={24} width={24} />
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
            <Facebooksvg height={24} width={24} />
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
            <Twittersvg height={24} width={24} />
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
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={{ color: "#AD40AF", fontWeight: "700" }}>SignUp</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
