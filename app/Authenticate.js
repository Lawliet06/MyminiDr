import { View, Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import Login from "../components/LoginScreen";
import SignUp from "../components/SignUpScreen";
import Welcome from "./Welcome";

const Stack = createNativeStackNavigator();

const Authenticate = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Welcome"
        component={Welcome}
        options={{ headerShown: false, headerTitleAlign: "center" }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false, headerTitleAlign: "center" }}
      />

      <Stack.Screen
        name="SignUp"
        component={SignUp}
        options={{ headerShown: false, headerTitleAlign: "center" }}
      />
    </Stack.Navigator>
  );
};

export default Authenticate;
