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

import { useState } from "react";
import Modal from "react-native-modal";
import { Linking } from "react-native";
import { signInAnonymously } from "firebase/auth";
import { FIREBASE_AUTH } from "../Firebaseconfig";

const background = require("../assets/images/bg2.jpg");

const Welcome = () => {
  const navigation = useNavigation();
  const [guestLoading, setGuestLoading] = useState(false);
  const [installModalVisible, setInstallModalVisible] = useState(false);
  const [policyModal, setPolicyModal] = useState(null); // 'privacy' | 'terms' | null

  const handleBegin = async () => {
    const userToken = await AsyncStorage.getItem("userToken");

    if (userToken) {
      navigation.navigate("Home");
    } else {
      navigation.navigate("NavLogin");
    }
  };

  const handleGuestEntry = async () => {
    try {
      setGuestLoading(true);
      try {
        await signInAnonymously(FIREBASE_AUTH);
      } catch (authError) {
        console.warn(
          "Firebase anonymous auth not configured or failed, using local guest session:",
          authError?.message
        );
      }
      let guestId = await AsyncStorage.getItem("guestUserId");
      if (!guestId) {
        guestId = `guest_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
        await AsyncStorage.setItem("guestUserId", guestId);
      }
      await AsyncStorage.setItem("userToken", "guest");
      navigation.navigate("Home");
    } catch (error) {
      console.error("Guest login fallback:", error);
      await AsyncStorage.setItem("userToken", "guest");
      navigation.navigate("Home");
    } finally {
      setGuestLoading(false);
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
          width: "100%",
        }}
      >
        <View
          style={{
            flex: 1,
            width: "100%",
            maxWidth: 480,
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            alignSelf: "center",
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 30,
                fontWeight: "bold",
                color: "#F0F8FF",
                marginTop: 40,
                textAlign: "center",
              }}
            >
              My Mini Dr
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              maxHeight: 280,
            }}
          >
            <Image
              source={require("../assets/images/drnb.png")}
              style={{ width: 240, height: 240 }}
              resizeMode="contain"
            />
          </View>

          <View
            style={{
              marginVertical: 10,
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#002244",
                backgroundColor: "#E1EBEE",
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 5,
              }}
            >
              Meet Tico!
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "bold",
                color: "#F0F8FF",
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              {"\n"}Your{" "}
              <Text style={{ color: "#6495ED" }}>AI Health Assistant</Text>
              <Text style={{ fontSize: 11, color: "#F0F8FF" }}>
                {"\n\n"}Tico is here to:
                {"\n"}
              </Text>
              <Text style={{ fontSize: 11, color: "#B0C4DE" }}>
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
            <TouchableOpacity onPress={() => setInstallModalVisible(true)}>
              <Text style={{ color: "#6495ED", marginTop: 10, fontSize: 14 }}>
                Click here on how to install the app on your Android phone
              </Text>
            </TouchableOpacity>

          </View>

          <View style={{ width: "100%", alignItems: "center", marginBottom: 25 }}>
            <TouchableOpacity
              onPress={handleBegin}
              style={{
                backgroundColor: "#6F00FF",
                padding: 16,
                width: "100%",
                maxWidth: 400,
                borderRadius: 25,
                marginBottom: 12,
                shadowColor: "blue",
                elevation: 8,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontWeight: "bold", fontSize: 16, color: "#F0F8FF" }}>
                Sign In / Get Started
              </Text>
            </TouchableOpacity>



            {/* Install Guide Modal */}
            <Modal
              isVisible={installModalVisible}
              onBackdropPress={() => setInstallModalVisible(false)}
              animationIn="slideInUp"
              animationOut="slideOutDown"
            >
              <View style={{ backgroundColor: "#1a1a2e", padding: 20, borderRadius: 12 }}>
                <Text style={{ color: "#F0F8FF", fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
                  Install MyMiniDr on Your Phone
                </Text>
                <Text style={{ color: "#E1EBEE", marginBottom: 6, fontWeight: "bold" }}>1️⃣ Running on Android Phone via Expo Go (Virtual / Live Preview)</Text>
                <Text style={{ color: "#E1EBEE", marginBottom: 6 }}>- Install Expo Go from Google Play Store.</Text>
                <Text style={{ color: "#E1EBEE", marginBottom: 6 }}>- Connect phone and computer to the same Wi‑Fi (or use tunnel mode: `npx expo start --tunnel`).</Text>
                <Text style={{ color: "#E1EBEE", marginBottom: 6 }}>- Start Expo server: `npx expo start`.</Text>
                <Text style={{ color: "#E1EBEE", marginBottom: 6 }}>- Scan QR code with Expo Go to preview the app.</Text>

                <Text style={{ color: "#E1EBEE", marginTop: 10, fontWeight: "bold" }}>2️⃣ Building & Installing a Standalone Android APK</Text>
                <Text style={{ color: "#E1EBEE", marginBottom: 6 }}>- Install EAS CLI: `npm install -g eas-cli`.</Text>
                <Text style={{ color: "#E1EBEE", marginBottom: 6 }}>- Log in: `eas login`.</Text>
                <Text style={{ color: "#E1EBEE", marginBottom: 6 }}>- Build APK: `eas build -p android --profile preview`.</Text>
                <Text style={{ color: "#E1EBEE", marginBottom: 6 }}>- Download the .apk via the provided URL/QR code, enable unknown sources, and install.</Text>
                <TouchableOpacity
                  onPress={() => setInstallModalVisible(false)}
                  style={{ marginTop: 15, alignSelf: "flex-end" }}
                >
                  <Text style={{ color: "#6495ED", fontSize: 16 }}>Close</Text>
                </TouchableOpacity>
              </View>
            </Modal>

            {/* Guest Button */}
            <TouchableOpacity
              onPress={handleGuestEntry}
              disabled={guestLoading}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.35)",
                padding: 14,
                width: "100%",
                maxWidth: 400,
                borderRadius: 25,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontWeight: "600", fontSize: 15, color: "#E1EBEE" }}>
                {guestLoading
                  ? "Connecting securely..."
                  : "Continue as Guest (No Sign Up)"}
              </Text>
            </TouchableOpacity>
            {/* Footer links */}
            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
              <TouchableOpacity onPress={() => setPolicyModal('privacy')}>
                <Text style={{ color: "#6495ED", marginHorizontal: 8, fontSize: 13 }}>Privacy Policy</Text>
              </TouchableOpacity>
              <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>|</Text>
              <TouchableOpacity onPress={() => setPolicyModal('terms')}>
                <Text style={{ color: "#6495ED", marginHorizontal: 8, fontSize: 13 }}>Terms of Service</Text>
              </TouchableOpacity>
            </View>

            {/* Policy Modal */}
            <Modal
              isVisible={policyModal !== null}
              onBackdropPress={() => setPolicyModal(null)}
              animationIn="fadeIn"
              animationOut="fadeOut"
              style={{ margin: 16 }}
            >
              <View style={{ backgroundColor: "#0f0f1e", borderRadius: 14, padding: 20, maxHeight: "85%" }}>
                <Text style={{ color: "#F0F8FF", fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
                  {policyModal === 'privacy' ? '🔒 Privacy Policy' : '📋 Terms of Service'}
                </Text>

                {policyModal === 'privacy' ? (
                  <>
                    <Text style={{ color: "#B0C4DE", fontSize: 13, marginBottom: 8 }}>Last Updated: September 9, 2026</Text>
                    <Text style={{ color: "#E1EBEE", marginBottom: 8, fontWeight: "bold" }}>1. Data We Collect</Text>
                    <Text style={{ color: "#B0C4DE", marginBottom: 8 }}>• Google Sign-In: name, email, profile picture (via Firebase Auth).{"\n"}• Guest Mode: anonymous Firebase session — no personal info required.{"\n"}• Chat messages: stored encrypted in Firebase Firestore.{"\n"}• Images (optional): sent to Google Vision API for analysis, never stored.</Text>
                    <Text style={{ color: "#E1EBEE", marginBottom: 8, fontWeight: "bold" }}>2. How We Protect Your Data</Text>
                    <Text style={{ color: "#B0C4DE", marginBottom: 8 }}>All chat messages are AES-256 encrypted with a unique key per user before being saved. We cannot read your health conversations.</Text>
                    <Text style={{ color: "#E1EBEE", marginBottom: 8, fontWeight: "bold" }}>3. Third-Party Services</Text>
                    <Text style={{ color: "#B0C4DE", marginBottom: 8 }}>Firebase (Google), Google Gemini AI, Google Cloud Vision. Each has their own privacy policies.</Text>
                    <Text style={{ color: "#E1EBEE", marginBottom: 8, fontWeight: "bold" }}>4. We Do Not Sell Your Data</Text>
                    <Text style={{ color: "#B0C4DE", marginBottom: 8 }}>We never sell, rent, or trade your personal or health information to third parties.</Text>
                    <Text style={{ color: "#E1EBEE", marginBottom: 8, fontWeight: "bold" }}>5. Children</Text>
                    <Text style={{ color: "#B0C4DE", marginBottom: 8 }}>MyMiniDr is not intended for children under 13.</Text>
                    <Text style={{ color: "#B0C4DE", marginBottom: 8, fontStyle: "italic" }}>Contact: support@myminidr.com</Text>
                  </>
                ) : (
                  <>
                    <Text style={{ color: "#B0C4DE", fontSize: 13, marginBottom: 8 }}>Last Updated: September 9, 2026</Text>
                    <Text style={{ color: "#E1EBEE", marginBottom: 8, fontWeight: "bold" }}>1. Medical Disclaimer ⚠️</Text>
                    <Text style={{ color: "#B0C4DE", marginBottom: 8 }}>MyMiniDr is NOT a medical device and is NOT a substitute for professional medical care. Dr. Tico cannot diagnose, prescribe, or treat any condition. Always consult a qualified healthcare professional. In emergencies, call your local emergency services immediately.</Text>
                    <Text style={{ color: "#E1EBEE", marginBottom: 8, fontWeight: "bold" }}>2. Acceptable Use</Text>
                    <Text style={{ color: "#B0C4DE", marginBottom: 8 }}>You may use the app for personal, non-commercial purposes only. You must not misuse, reverse-engineer, or use the app to harm others.</Text>
                    <Text style={{ color: "#E1EBEE", marginBottom: 8, fontWeight: "bold" }}>3. AI-Generated Content</Text>
                    <Text style={{ color: "#B0C4DE", marginBottom: 8 }}>Responses are generated by AI and may not always be accurate. Verify all health information with a licensed professional.</Text>
                    <Text style={{ color: "#E1EBEE", marginBottom: 8, fontWeight: "bold" }}>4. Eligibility</Text>
                    <Text style={{ color: "#B0C4DE", marginBottom: 8 }}>You must be at least 13 years old to use this app.</Text>
                    <Text style={{ color: "#E1EBEE", marginBottom: 8, fontWeight: "bold" }}>5. Limitation of Liability</Text>
                    <Text style={{ color: "#B0C4DE", marginBottom: 8 }}>The app is provided "as is". We are not liable for health decisions made based on AI responses.</Text>
                    <Text style={{ color: "#B0C4DE", marginBottom: 8, fontStyle: "italic" }}>Contact: support@myminidr.com</Text>
                  </>
                )}

                <TouchableOpacity
                  onPress={() => setPolicyModal(null)}
                  style={{ marginTop: 14, alignSelf: "center", backgroundColor: "#6F00FF", paddingHorizontal: 28, paddingVertical: 10, borderRadius: 20 }}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>Close</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Welcome;
