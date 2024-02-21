import { MaterialIcons } from "@expo/vector-icons";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useNavigation } from "@react-navigation/native";

const Welcome = () => {
  const navigation = useNavigation();

  const handleBegin = async () => {
    const userToken = await AsyncStorage.getItem("userToken");
  
    if (userToken) {
      navigation.navigate("Home");
    } else {
      navigation.navigate("NavLogin");
    }
  };
  

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#dedede",
      }}
    >
      <View>
        <Text
          style={{
            fontSize: 30,
            fontWeight: "bold",
            color: "#20315f",
            marginTop: 20,
          }}
        >
          My Mini Dr
        </Text>
      </View>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Image
          source={require("../assets/images/Myminidr.png")}
          style={{ width: 200 }}
          resizeMode="contain"
        />
      </View>
      <TouchableOpacity
        onPress={handleBegin}
        style={{
          backgroundColor: "purple",
          padding: 20,
          width: "90%",
          borderRadius: 30,
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 50,
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 15, color: "white" }}>
          Let's Begin
        </Text>
        <MaterialIcons name="arrow-forward-ios" size={22} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Welcome;
