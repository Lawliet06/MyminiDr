import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import InputField from "../components/InputField";
import CustomButton from "../components/CustomButton";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import Ragistrationsvg from "../assets/images/icons/registration.svg";

import Googlesvg from "../assets/images/icons/google.svg";
import Facebooksvg from "../assets/images/icons/facebook.svg";

import { FIREBASE_AUTH } from "../Firebaseconfig";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

import { getFirestore, setDoc, doc } from "firebase/firestore";
import { FIREBASE_APP } from "../Firebaseconfig";

import AsyncStorage from "@react-native-async-storage/async-storage";

const firestore = getFirestore(FIREBASE_APP);

const SignupScreen = ({ navigation }) => {
  const saveLoginState = async () => {
    try {
      await AsyncStorage.setItem("userToken", "loggedIn");
    } catch (error) {
      console.error("Error saving login state:", error);
    }
  };

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

      // Add user data to Firestore
      await setDoc(userDocRef, {
        fullName,
        dateOfBirth:
          selectedDate instanceof Date
            ? selectedDate.toDateString()
            : selectedDate,
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

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ paddingHorizontal: 25 }}
      >
        <View style={{ alignItems: "center", backgroundColor: "red" }}>
          <Ragistrationsvg width={100} height={100} />
        </View>

        <Text
          style={{
            fontSize: 28,
            fontWeight: "500",
            color: "#333",
            marginBottom: 20,
          }}
        >
          SignUp
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginBottom: 10 }}>
          <TouchableOpacity
            onPress={() => {}}
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
            onPress={() => {}}
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

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <CustomButton label={"SignUp"} onPress={() => SignUp()} />
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 30,
          }}
        >
          <Text style={{ marginRight: 5 }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("NavLogin")}>
            <Text style={{ color: "#AD40AF", fontWeight: "700" }}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignupScreen;
