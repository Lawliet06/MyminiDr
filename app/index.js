import Auth from "./Authenticate";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Authentication"
        component={Auth}
        options={{ headerShown: false, headerTitleAlign: "center" }}
      />
    </Stack.Navigator>
  );
};

export default App;
