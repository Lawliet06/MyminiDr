import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ChatScreen from "../Screens/ChatScreen";

const Stack = createNativeStackNavigator();

const NavChat = () => {
  return (
    <Stack.Navigator>

      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          headerShown: false,
          headerTitle: "Chat with Tico",
          headerStyle: { backgroundColor: "#1E1E1E" },
          headerTitleStyle: { color: "#fff" },
          headerTintColor: "#fff", 
        }}
      />
    </Stack.Navigator>
  );
};

export default NavChat;
