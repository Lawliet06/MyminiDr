import { MaterialIcons } from "@expo/vector-icons";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useNavigation } from "@react-navigation/native";

const background = require("../assets/images/bg2.jpg");

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
    <ImageBackground
      source={background}
      style={{
        flex: 1,
        resizeMode: "cover",
      }}
    >
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",

          alignItems: "center",
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 30,
              fontWeight: "bold",
              color: "#F0F8FF",
              marginTop: 50,
            }}
          >
            My Mini Dr
          </Text>
        </View>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Image
            source={require("../assets/images/drnb.png")}
            style={{ width: 280, marginBottom: 10, padding: 10 }}
            resizeMode="contain"
          />
        </View>

        <View
          style={{ margin: 8, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#002244",
              backgroundColor: "#E1EBEE",
              borderRadius: 10,
              padding: 5,
            }}
          >
            Meet Tico!
          </Text>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "bold",
              color: "#F0F8FF",
              marginBottom: 90,
            }}
          >
            {"\n"}Your{" "}
            <Text style={{ color: "#6495ED" }}>AI Health Assistant</Text>
            <Text style={{ fontSize: 10, color: "#F0F8FF" }}>
              {"\n\n"}Tico is here to:
              {"\n\n"}
            </Text>
            <Text style={{ fontSize: 10, color: "#B0C4DE" }}>
              <MaterialIcons name="arrow-forward-ios" size={8} color="white" />{" "}
              Help you manage your health with personalized tips.{"\n"}
              <MaterialIcons
                name="arrow-forward-ios"
                size={8}
                color="white"
              />{" "}
              Provide insights based on your symptoms.{"\n"}
              <MaterialIcons
                name="arrow-forward-ios"
                size={8}
                color="white"
              />{" "}
              Offer mental health advice and emotional support.{"\n"}
              <MaterialIcons
                name="arrow-forward-ios"
                size={8}
                color="white"
              />{" "}
              Suggest safe and accurate medication information.
            </Text>
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleBegin}
          style={{
            backgroundColor: "#6F00FF",
            padding: 20,
            width: "90%",
            borderRadius: 25,
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 40,
            shadowColor: "blue",
            elevation: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 16, color: "#F0F8FF" }}>
            Let's Talk
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Welcome;
