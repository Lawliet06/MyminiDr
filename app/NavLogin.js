import React from "react";

import Login from "../components/LoginScreen";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

const Test = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false, headerTitleAlign: "center" }}
      />
    </Stack.Navigator>
  );
};

export default Test;
