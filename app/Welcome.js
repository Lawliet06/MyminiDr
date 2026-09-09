import { MaterialIcons, FontAwesome as Icon } from "@expo/vector-icons";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import Modal from "react-native-modal";
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
          width: "100%",
        }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 480,
              alignItems: "center",
              paddingHorizontal: 20,
              alignSelf: "center",
            }}
          >
            <Text
              style={{
                fontSize: 30,
                fontWeight: "bold",
                color: "#F0F8FF",
                marginTop: 20,
                textAlign: "center",
              }}
            >
              My Mini Dr
            </Text>

            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginVertical: 15,
              }}
            >
              <Image
                source={require("../assets/images/drnb.png")}
                style={{ width: 220, height: 220 }}
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
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                }}
              >
                Meet Tico!
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  color: "#F0F8FF",
                  marginBottom: 10,
                  textAlign: "center",
                }}
              >
                {"\n"}Your{" "}
                <Text style={{ color: "#6495ED" }}>AI Health Assistant</Text>
                <Text style={{ fontSize: 11, color: "#F0F8FF" }}>
                  {"\n\n"}Tico is here to:
                  {"\n"}
                </Text>
                <Text style={{ fontSize: 12, color: "#B0C4DE", lineHeight: 20 }}>
                  <MaterialIcons name="arrow-forward-ios" size={9} color="white" />{" "}
                  Help you manage your health with personalized tips.{"\n"}
                  <MaterialIcons name="arrow-forward-ios" size={9} color="white" />{" "}
                  Provide insights based on your symptoms.{"\n"}
                  <MaterialIcons name="arrow-forward-ios" size={9} color="white" />{" "}
                  Offer mental health advice and emotional support.{"\n"}
                  <MaterialIcons name="arrow-forward-ios" size={9} color="white" />{" "}
                  Suggest safe and accurate medication information.
                </Text>
              </Text>
              <TouchableOpacity onPress={() => setInstallModalVisible(true)}>
                <Text style={{ color: "#6495ED", marginVertical: 8, fontSize: 13, textDecorationLine: "underline" }}>
                  📱 How to install the app on your Android phone
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ width: "100%", alignItems: "center", marginTop: 10, marginBottom: 15 }}>
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
              <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 16, alignItems: "center" }}>
                <TouchableOpacity onPress={() => setPolicyModal('privacy')}>
                  <Text style={{ color: "#6495ED", marginHorizontal: 8, fontSize: 13 }}>Privacy Policy</Text>
                </TouchableOpacity>
                <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>|</Text>
                <TouchableOpacity onPress={() => setPolicyModal('terms')}>
                  <Text style={{ color: "#6495ED", marginHorizontal: 8, fontSize: 13 }}>Terms of Service</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Install Guide Modal */}
        <Modal
          isVisible={installModalVisible}
          onBackdropPress={() => setInstallModalVisible(false)}
          animationIn="fadeIn"
          animationOut="fadeOut"
          style={{ margin: 16, justifyContent: "center", alignItems: "center" }}
        >
          <View
            style={{
              backgroundColor: "#111124",
              borderRadius: 18,
              padding: 20,
              width: "100%",
              maxWidth: 500,
              maxHeight: "85%",
              display: "flex",
              flexDirection: "column",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.12)",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: "rgba(255,255,255,0.1)",
                paddingBottom: 10,
              }}
            >
              <Text style={{ color: "#F0F8FF", fontSize: 18, fontWeight: "bold" }}>
                📱 Install on Android Phone
              </Text>
              <TouchableOpacity
                onPress={() => setInstallModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="times" size={20} color="#B0C4DE" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flexShrink: 1 }}
              contentContainerStyle={{ paddingVertical: 4 }}
              showsVerticalScrollIndicator={true}
            >
              <Text style={{ color: "#6495ED", marginBottom: 6, fontWeight: "bold", fontSize: 14 }}>
                1️⃣ Preview via Expo Go (Fast & Live)
              </Text>
              <Text style={{ color: "#E1EBEE", marginBottom: 6, fontSize: 13, lineHeight: 18 }}>
                • Install <Text style={{ fontWeight: "bold", color: "#fff" }}>Expo Go</Text> from Google Play Store.
              </Text>
              <Text style={{ color: "#E1EBEE", marginBottom: 6, fontSize: 13, lineHeight: 18 }}>
                • Connect your phone and PC to the same Wi‑Fi network.
              </Text>
              <Text style={{ color: "#E1EBEE", marginBottom: 6, fontSize: 13, lineHeight: 18 }}>
                • Run in terminal: <Text style={{ fontFamily: "monospace", color: "#6495ED" }}>npx expo start</Text>
              </Text>
              <Text style={{ color: "#E1EBEE", marginBottom: 14, fontSize: 13, lineHeight: 18 }}>
                • Scan the QR code displayed in your terminal using Expo Go.
              </Text>

              <Text style={{ color: "#6495ED", marginBottom: 6, fontWeight: "bold", fontSize: 14 }}>
                2️⃣ Standalone APK Installation
              </Text>
              <Text style={{ color: "#E1EBEE", marginBottom: 6, fontSize: 13, lineHeight: 18 }}>
                • Install EAS CLI: <Text style={{ fontFamily: "monospace", color: "#6495ED" }}>npm install -g eas-cli</Text>
              </Text>
              <Text style={{ color: "#E1EBEE", marginBottom: 6, fontSize: 13, lineHeight: 18 }}>
                • Log in to Expo: <Text style={{ fontFamily: "monospace", color: "#6495ED" }}>eas login</Text>
              </Text>
              <Text style={{ color: "#E1EBEE", marginBottom: 6, fontSize: 13, lineHeight: 18 }}>
                • Build APK: <Text style={{ fontFamily: "monospace", color: "#6495ED" }}>eas build -p android --profile preview</Text>
              </Text>
              <Text style={{ color: "#E1EBEE", marginBottom: 10, fontSize: 13, lineHeight: 18 }}>
                • Download the APK from the generated URL, enable unknown sources, and install directly on your device.
              </Text>
            </ScrollView>

            <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" }}>
              <TouchableOpacity
                onPress={() => setInstallModalVisible(false)}
                style={{
                  backgroundColor: "#6F00FF",
                  paddingVertical: 12,
                  borderRadius: 22,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Policy & Terms Modal */}
        <Modal
          isVisible={policyModal !== null}
          onBackdropPress={() => setPolicyModal(null)}
          animationIn="fadeIn"
          animationOut="fadeOut"
          style={{ margin: 16, justifyContent: "center", alignItems: "center" }}
        >
          <View
            style={{
              backgroundColor: "#0f0f1e",
              borderRadius: 18,
              padding: 20,
              width: "100%",
              maxWidth: 520,
              maxHeight: "85%",
              display: "flex",
              flexDirection: "column",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.12)",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
                borderBottomWidth: 1,
                borderBottomColor: "rgba(255,255,255,0.1)",
                paddingBottom: 10,
              }}
            >
              <Text style={{ color: "#F0F8FF", fontSize: 18, fontWeight: "bold" }}>
                {policyModal === "privacy" ? "🔒 Privacy Policy" : "📋 Terms of Service"}
              </Text>
              <TouchableOpacity
                onPress={() => setPolicyModal(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="times" size={20} color="#B0C4DE" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flexShrink: 1 }}
              contentContainerStyle={{ paddingVertical: 6, paddingRight: 4 }}
              showsVerticalScrollIndicator={true}
            >
              {policyModal === "privacy" ? (
                <>
                  <Text style={{ color: "#6495ED", fontSize: 12, marginBottom: 8 }}>Last Updated: September 9, 2026</Text>
                  <Text style={{ color: "#E1EBEE", marginBottom: 4, fontWeight: "bold", fontSize: 14 }}>1. Data We Collect</Text>
                  <Text style={{ color: "#B0C4DE", marginBottom: 8, fontSize: 13, lineHeight: 18 }}>
                    • <Text style={{ color: "#fff", fontWeight: "600" }}>Google Sign-In:</Text> Name, email, profile picture (via Firebase Auth).{"\n"}
                    • <Text style={{ color: "#fff", fontWeight: "600" }}>Guest Mode:</Text> Anonymous Firebase session — no personal information required.{"\n"}
                    • <Text style={{ color: "#fff", fontWeight: "600" }}>Chat Messages:</Text> Encrypted client-side with AES-256 before being stored in Firebase Firestore.{"\n"}
                    • <Text style={{ color: "#fff", fontWeight: "600" }}>Images (optional):</Text> Processed in memory for medical OCR / visual diagnosis — never permanently stored.
                  </Text>
                  <Text style={{ color: "#E1EBEE", marginBottom: 4, fontWeight: "bold", fontSize: 14 }}>2. How We Protect Your Data</Text>
                  <Text style={{ color: "#B0C4DE", marginBottom: 8, fontSize: 13, lineHeight: 18 }}>
                    All chat message payloads are encrypted with AES-256 using user-specific keys. We cannot view or read your confidential medical conversations.
                  </Text>
                  <Text style={{ color: "#E1EBEE", marginBottom: 4, fontWeight: "bold", fontSize: 14 }}>3. Third-Party Services</Text>
                  <Text style={{ color: "#B0C4DE", marginBottom: 8, fontSize: 13, lineHeight: 18 }}>
                    Firebase (Google), Google Gemini AI, Google Cloud Vision. Each operates under strict privacy and security standards.
                  </Text>
                  <Text style={{ color: "#E1EBEE", marginBottom: 4, fontWeight: "bold", fontSize: 14 }}>4. We Do Not Sell Your Data</Text>
                  <Text style={{ color: "#B0C4DE", marginBottom: 8, fontSize: 13, lineHeight: 18 }}>
                    We never sell, rent, or monetize your health information or personal details to any advertisers or third parties.
                  </Text>
                  <Text style={{ color: "#E1EBEE", marginBottom: 4, fontWeight: "bold", fontSize: 14 }}>5. Age Requirement</Text>
                  <Text style={{ color: "#B0C4DE", marginBottom: 8, fontSize: 13, lineHeight: 18 }}>
                    MyMiniDr is designed for users 13 years of age and older.
                  </Text>
                  <Text style={{ color: "#6495ED", fontSize: 12, marginTop: 4 }}>📧 Contact: support@myminidr.com</Text>
                </>
              ) : (
                <>
                  <Text style={{ color: "#6495ED", fontSize: 12, marginBottom: 8 }}>Last Updated: September 9, 2026</Text>
                  <Text style={{ color: "#FF6B6B", marginBottom: 4, fontWeight: "bold", fontSize: 14 }}>1. Medical Disclaimer ⚠️</Text>
                  <Text style={{ color: "#B0C4DE", marginBottom: 8, fontSize: 13, lineHeight: 18 }}>
                    MyMiniDr is NOT a certified medical device and does NOT provide medical diagnosis, treatment, or prescriptions. Dr. Tico is an AI assistant intended solely for educational and informational purposes. Always seek the advice of a qualified physician or healthcare provider. In an emergency, contact your local emergency services immediately.
                  </Text>
                  <Text style={{ color: "#E1EBEE", marginBottom: 4, fontWeight: "bold", fontSize: 14 }}>2. Acceptable Use</Text>
                  <Text style={{ color: "#B0C4DE", marginBottom: 8, fontSize: 13, lineHeight: 18 }}>
                    You agree to use MyMiniDr for personal, lawful, non-commercial purposes. You must not attempt to reverse engineer, disrupt, or exploit the services.
                  </Text>
                  <Text style={{ color: "#E1EBEE", marginBottom: 4, fontWeight: "bold", fontSize: 14 }}>3. AI Limitations</Text>
                  <Text style={{ color: "#B0C4DE", marginBottom: 8, fontSize: 13, lineHeight: 18 }}>
                    AI responses can occasionally be inaccurate. Always verify medication names, dosages, and medical instructions with a doctor or pharmacist.
                  </Text>
                  <Text style={{ color: "#E1EBEE", marginBottom: 4, fontWeight: "bold", fontSize: 14 }}>4. Limitation of Liability</Text>
                  <Text style={{ color: "#B0C4DE", marginBottom: 8, fontSize: 13, lineHeight: 18 }}>
                    The service is provided on an "AS IS" basis. To the maximum extent permitted by law, MyMiniDr disclaims liability for any actions taken based on AI outputs.
                  </Text>
                  <Text style={{ color: "#6495ED", fontSize: 12, marginTop: 4 }}>📧 Contact: support@myminidr.com</Text>
                </>
              )}
            </ScrollView>

            <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" }}>
              <TouchableOpacity
                onPress={() => setPolicyModal(null)}
                style={{
                  backgroundColor: "#6F00FF",
                  paddingVertical: 12,
                  borderRadius: 22,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Welcome;
