import React from "react";

import SignUp from "../components/SignUpScreen";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

const Test = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SignUp"
        component={SignUp}
        options={{ headerShown: false, headerTitleAlign: "center" }}
      />
    </Stack.Navigator>
  );
};

export default Test;
