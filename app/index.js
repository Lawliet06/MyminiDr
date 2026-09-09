import NavLogin from "./NavLogin";
import NavSignUp from "./NavSignUp";
import Home from "./Home";
import ChatScreen from "./NavChat";

import Welcome from "./Welcome";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { Platform } from "react-native";

// Initialize SDK only on native platforms before your app renders
if (Platform.OS !== "web") {
  try {
    const { Settings } = require("react-native-fbsdk-next");
    Settings?.initializeSDK?.();
  } catch (e) {
    console.log("Facebook SDK not initialized:", e?.message);
  }
}

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Welcome"
        component={Welcome}
        options={{ headerShown: false, headerTitleAlign: "center" }}
      />
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false, headerTitleAlign: "center" }}
      />
      <Stack.Screen
        name="NavChat"
        component={ChatScreen}
        options={{ headerShown: false, headerTitleAlign: "center" }}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{ headerShown: false, headerTitleAlign: "center" }}
      />
      <Stack.Screen
        name="NavLogin"
        component={NavLogin}
        options={{ headerShown: false, headerTitleAlign: "center" }}
      />

      <Stack.Screen
        name="NavSignUp"
        component={NavSignUp}
        options={{ headerShown: false, headerTitleAlign: "center" }}
      />
    </Stack.Navigator>
  );
};

export default App;
