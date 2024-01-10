import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React from "react";

import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import InputField from "./InputField";
import CustomButton from "./CustomButton";
import DatePicker from "react-native-date-picker";

import Ragistrationsvg from "../assets/images/icons/registration.svg";
import Googlesvg from "../assets/images/icons/google.svg";
import Facebooksvg from "../assets/images/icons/facebook.svg";
import Twittersvg from "../assets/images/icons/twitter.svg";
import { useState } from "react";

const SignupScreen = ({ navigation }) => {
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
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
            marginBottom: 25,
          }}
        >
          SignUp
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 30,
          }}
        >
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

        <Text style={{ textAlign: "center", color: "#666", marginBottom: 20 }}>
          Or, SignUP with your Email
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
        />

        <InputField
          label={"Confirm Password"}
          icon={
            <Ionicons
              name="ios-lock-closed-outline"
              size={19}
              color="grey"
              style={{ marginTop: 5, marginRight: 5 }}
            />
          }
          inputType="password"
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

          <TouchableOpacity onPress={() => setOpen(true)}>
            <Text style={{ color: "#666", marginLeft: 5, marginTop: 5 }}>
              Date of Birth
            </Text>
          </TouchableOpacity>
        </View>

        <DatePicker
          modal
          open={open}
          date={date}
          onConfirm={(date) => {
            setOpen(false);
            setDate(date);
          }}
          onCancel={() => {
            setOpen(false);
          }}
        />

        <CustomButton label={"SignUp"} onPress={() => {}} />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 30,
          }}
        >
          <Text style={{ marginRight: 5 }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={{ color: "#AD40AF", fontWeight: "700" }}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignupScreen;
