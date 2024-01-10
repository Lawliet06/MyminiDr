import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React from "react";
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

const LoginScreen = ({ navigation }) => {
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
          fieldButtonLabel={'Forgot password?'}
          fieldButtonFunction={() => {}}
        />


        <CustomButton label={"Login"} onPress={() => {}} />

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
