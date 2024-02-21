import NavLogin from "./NavLogin";
import NavSignUp from "./NavSignUp";
import Home from "./Home";


import Welcome from "./Welcome";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

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
