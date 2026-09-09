import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from "react-native-modal";
import Icon from "react-native-vector-icons/FontAwesome";
import { MaterialIcons } from "@expo/vector-icons";
import { FIREBASE_AUTH, FIREBASE_DB } from "../Firebaseconfig";
import {
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut,
} from "firebase/auth";
import {
  collection,
  getDocs,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { decryptChatDocument, decryptData } from "../services/encryption";

const background = require("../assets/images/bg6.jpg");

const Home = () => {
  const navigation = useNavigation();
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [userName, setUserName] = useState("");
  const [isAboutModalVisible, setAboutModalVisible] = useState(false);
  const [isPolicyModalVisible, setPolicyModalVisible] = useState(false);

  const isGuest = FIREBASE_AUTH.currentUser?.isAnonymous;

  const handleExit = () => navigation.navigate("Welcome");

  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH);
    } catch (e) {
      console.log("Logout error:", e);
    }
    await AsyncStorage.removeItem("userToken");
    navigation.navigate("Welcome");
  };

  const handleDeleteAccount = () => {
    if (FIREBASE_AUTH.currentUser?.isAnonymous) {
      // Guest users can delete/clear immediately
      handleGuestAccountClear();
      return;
    }
    setPasswordModalVisible(true);
  };

  const handleGuestAccountClear = async () => {
    try {
      setDeletingAccount(true);
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        await deleteUser(user);
      }
      await AsyncStorage.removeItem("userToken");
      navigation.navigate("Welcome");
    } catch (e) {
      console.error("Error clearing guest session:", e);
      alert("Failed to reset session.");
    } finally {
      setDeletingAccount(false);
    }
  };

  const handlePasswordConfirmation = async () => {
    try {
      setDeletingAccount(true);
      const user = FIREBASE_AUTH.currentUser;
      if (!user) return;

      if (user.isAnonymous) {
        await deleteUser(user);
        await AsyncStorage.removeItem("userToken");
        navigation.navigate("Welcome");
        return;
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        passwordInput
      );
      await reauthenticateWithCredential(user, credential);
      await deleteUser(user);
      await AsyncStorage.removeItem("userToken");
      navigation.navigate("Welcome");
    } catch (error) {
      const errorMessage =
        error.code === "auth/invalid-credential"
          ? "Incorrect Password"
          : "Failed to delete account. Please try again.";
      alert(errorMessage);
    } finally {
      setDeletingAccount(false);
      setPasswordModalVisible(false);
    }
  };

  const fetchChatHistory = async () => {
    setIsLoadingChats(true);
    try {
      const currentUser = FIREBASE_AUTH.currentUser;
      let userId = currentUser?.uid;
      if (!userId) {
        userId = await AsyncStorage.getItem("guestUserId");
      }

      if (!userId) {
        setIsLoadingChats(false);
        return;
      }

      // If user is authenticated in Firebase
      if (currentUser) {
        const chatsRef = collection(FIREBASE_DB, `users/${userId}/chats`);

        const unsubscribe = onSnapshot(
          chatsRef,
          (querySnapshot) => {
            const chats = [];
            querySnapshot.forEach((docSnap) => {
              const chatData = docSnap.data();

              // Decrypt chat messages
              const decryptedMessages = decryptChatDocument(chatData, userId);

              // Title is stored plain
              let title = chatData.title;

              if (!title || title === "Untitled Chat") {
                const firstUserMessage = decryptedMessages.find(
                  (msg) => msg.type === "user"
                );
                title = firstUserMessage
                  ? firstUserMessage.text.split(" ").slice(0, 5).join(" ")
                  : `Chat ${chats.length + 1}`;
              }

              // Add timestamp to help with sorting
              chats.push({
                id: docSnap.id,
                title,
                ...chatData,
                messages: decryptedMessages,
                timestamp: chatData.timestamp || Date.now(),
              });
            });

            // Sort: most recently updated first
            const sortedChats = chats.sort((a, b) => {
              const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : (a.timestamp || 0);
              const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : (b.timestamp || 0);
              return bTime - aTime;
            });

            setChatHistory(sortedChats);
            setIsLoadingChats(false);
          },
          (error) => {
            console.warn("Notice: Firestore chat history:", error?.message);
            setIsLoadingChats(false);
          }
        );

        return unsubscribe;
      } else {
        // Fallback for local guest session: load from local storage
        try {
          const keys = await AsyncStorage.getAllKeys();
          const chatKeys = keys.filter((k) => k.startsWith("chat_"));
          const chats = [];
          for (const k of chatKeys) {
            const raw = await AsyncStorage.getItem(k);
            if (raw) {
              const data = JSON.parse(raw);
              const decMessages = decryptChatDocument(data, userId);
              let title = data.title;
              chats.push({
                id: k.replace("chat_", ""),
                title: title || "Guest Chat",
                ...data,
                messages: decMessages,
              });
            }
          }
          // Sort: most recently updated first
          const sortedGuest = chats.sort((a, b) => {
            const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : (a.timestamp || 0);
            const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : (b.timestamp || 0);
            return bTime - aTime;
          });
          setChatHistory(sortedGuest);
        } catch (e) {
          console.warn("Local chat read notice:", e);
        }
        setIsLoadingChats(false);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      setIsLoadingChats(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const userToken = await AsyncStorage.getItem("userToken");
      const currentUser = FIREBASE_AUTH.currentUser;

      if (userToken === "guest" || !currentUser || currentUser.isAnonymous) {
        setUserName("Guest User");
        return;
      }

      // First try to get the display name directly from the auth object
      if (currentUser.displayName) {
        setUserName(currentUser.displayName);

        // Update the user document in Firestore with the display name
        const userRef = doc(FIREBASE_DB, "users", currentUser.uid);
        await setDoc(
          userRef,
          {
            fullName: currentUser.displayName,
            email: currentUser.email,
            provider: currentUser.providerData[0]?.providerId || "email",
            lastUpdated: new Date().toISOString(),
          },
          { merge: true }
        );

        return;
      }

      // If no display name in auth object, try to get from Firestore
      const userDoc = await getDoc(doc(FIREBASE_DB, "users", currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.fullName) {
          setUserName(userData.fullName);
        } else if (userData.displayName) {
          setUserName(userData.displayName);
        } else {
          setUserName(currentUser.email?.split("@")[0] || "User");
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      const currentUser = FIREBASE_AUTH.currentUser;
      setUserName(currentUser?.email?.split("@")[0] || "User");
    }
  };

  useEffect(() => {
    let unsubscribeChat;
    const initialize = async () => {
      await fetchUserData();
      unsubscribeChat = await fetchChatHistory();
      setIsLoading(false);
    };

    initialize();

    return () => {
      if (typeof unsubscribeChat === "function") {
        unsubscribeChat();
      }
    };
  }, []);

  if (isLoading) {
    // Global loader when the app is initializing
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loaderText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={background}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          resizeMode: "cover",
          width: "100%",
          height: "100%",
        }}
    >
      <View style={styles.container}>
        <Modal
          isVisible={isSidebarVisible}
          backdropOpacity={0.5}
          onBackdropPress={() => setSidebarVisible(false)} 
          animationIn="slideInLeft"
          animationOut="slideOutLeft"
          style={{ margin: 0, justifyContent: "flex-start" }} 
        >
          {/* Sidebar */}
          {isSidebarVisible && (
            <View style={styles.sidebar}>
              <ImageBackground
                source={require("../assets/images/bg4.jpg")}
                style={{
                  flex: 1,
                  opacity: 0.9,
                  resizeMode: "cover",
                  borderRadius: 20,
                  overflow: "hidden",
                }}
              >
                <TouchableOpacity
                  onPress={handleExit}
                  style={styles.sidebarItem}
                >
                  <Icon name="sign-out" size={18} color="#fff" />
                  <Text style={styles.sidebarText}>Exit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { setSidebarVisible(false); setAboutModalVisible(true); }}
                  style={styles.sidebarItem}
                >
                  <Icon name="question-circle" size={18} color="#fff" />
                  <Text style={styles.sidebarText}>About us</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { setSidebarVisible(false); setPolicyModalVisible(true); }}
                  style={styles.sidebarItem}
                >
                  <Icon name="lock" size={18} color="#fff" />
                  <Text style={styles.sidebarText}>Policy & terms</Text>
                </TouchableOpacity>
                {isGuest && (
                  <TouchableOpacity
                    onPress={() => {
                      setSidebarVisible(false);
                      navigation.navigate("NavSignUp");
                    }}
                    style={[
                      styles.sidebarItem,
                      {
                        backgroundColor: "rgba(111, 0, 255, 0.4)",
                        padding: 8,
                        borderRadius: 10,
                      },
                    ]}
                  >
                    <Icon name="user-plus" size={18} color="#00ffcc" />
                    <Text
                      style={[
                        styles.sidebarText,
                        { color: "#00ffcc", fontWeight: "bold" },
                      ]}
                    >
                      Sign Up to Save
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={handleLogout}
                  style={styles.sidebarItem}
                >
                  <Icon name="power-off" size={18} color="#fff" />
                  <Text style={styles.sidebarText}>Logout</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDeleteAccount}
                  style={styles.sidebarItem}
                  disabled={deletingAccount}
                >
                  <Icon name="trash" size={20} color="#8B0000" />
                  <Text style={styles.sidebarText}>
                    {deletingAccount
                      ? "Deleting..."
                      : isGuest
                      ? "Clear Guest Session"
                      : "Delete Account"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeSidebar}
                  onPress={() => setSidebarVisible(false)}
                >
                  <Icon name="times" size={30} color="#65000B" />
                </TouchableOpacity>
              </ImageBackground>
            </View>
          )}
        </Modal>
        <View style={{ marginBottom: 100 }}>
          {/* Hamburger Menu (Cogwheel) */}
          <TouchableOpacity
            style={styles.cogwheelMenu}
            onPress={() => setSidebarVisible(true)}
          >
            <Icon
              name="cog"
              size={35}
              color="#F0F8FF"
              style={styles.cogwheelIcon}
            />
          </TouchableOpacity>

          <View style={styles.headerImageContainer}>
            <Image
              source={require("../assets/images/hd1.png")}
              style={styles.headerImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Main Content */}
        <ScrollView contentContainerStyle={styles.mainContent}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Text style={[styles.welcomeText, { marginBottom: 0 }]}>
              Welcome {userName}!
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginLeft: 10,
                backgroundColor: "rgba(76, 175, 80, 0.2)",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(76, 175, 80, 0.4)",
              }}
            >
              <Icon name="lock" size={12} color="#4CAF50" />
              <Text
                style={{
                  color: "#4CAF50",
                  fontSize: 11,
                  marginLeft: 4,
                  fontWeight: "600",
                }}
              >
                Encrypted
              </Text>
            </View>
          </View>
          <View style={styles.cardsContainer}>
            {/* Chat Card */}
            <TouchableOpacity
              style={styles.card1}
              onPress={() => navigation.navigate("ChatScreen")}
            >
              <Icon
                name="weixin"
                size={30}
                color="#F0F8FF"
                backgroundColor="#000f89"
                padding={10}
                style={{ borderRadius: 30, marginRight: 41 }}
              />
              <MaterialIcons name="arrow-outward" size={20} color="#F0F8FF" />
              <Text style={styles.cardText}>Start a new chat</Text>
            </TouchableOpacity>

            {/* Talk Card */}
            <TouchableOpacity
              style={styles.card2}
              onPress={() => navigation.navigate("ChatScreen")}
            >
              <Icon
                name="camera"
                size={30}
                color="#F0F8FF"
                backgroundColor="#000f89"
                padding={10}
                style={{ borderRadius: 30, marginRight: 41 }}
              />
              <MaterialIcons name="arrow-outward" size={20} color="#F0F8FF" />
              <Text style={styles.cardText}>Send Tico an image</Text>
            </TouchableOpacity>
          </View>

          {/* History Section */}
          <Text style={styles.sectionTitle}>Recent Chats</Text>
      <ScrollView style={styles.historyContainer}>
        {isLoadingChats ? (
          <View style={styles.loaderContainerChats}>
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text style={styles.loaderText}>Loading chats...</Text>
          </View>
        ) : chatHistory.length > 0 ? (
          chatHistory.map((chat, index) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.historyItem}
              onPress={() =>
                navigation.navigate("ChatScreen", {
                  screen: "Chat",
                  params: {
                    chatData: chat,
                    chatId: chat.id,
                  },
                })
              }
            >
              <Icon name="clock-o" size={18} color="#fff" />
              <Text style={styles.historyText}>{chat.title}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.loaderContainer}>
            <Text style={styles.loaderText}>No chat history found</Text>
          </View>
        )}
      </ScrollView>
        </ScrollView>

        {/* About Us Modal */}
        <Modal
          isVisible={isAboutModalVisible}
          onBackdropPress={() => setAboutModalVisible(false)}
          animationIn="fadeIn"
          animationOut="fadeOut"
          style={{ margin: 16 }}
        >
          <View style={{ backgroundColor: "#0d0d1a", borderRadius: 16, padding: 22 }}>
            <Text style={{ color: "#F0F8FF", fontSize: 20, fontWeight: "bold", marginBottom: 4 }}>🩺 About MyMiniDr</Text>
            <Text style={{ color: "#6495ED", fontSize: 13, marginBottom: 14 }}>Your AI-powered personal health companion</Text>

            <Text style={{ color: "#E1EBEE", fontWeight: "bold", marginBottom: 6 }}>Who We Are</Text>
            <Text style={{ color: "#B0C4DE", marginBottom: 12, lineHeight: 20 }}>
              MyMiniDr is a personal health assistant application powered by Google's Gemini AI. Our AI companion, Dr. Tico, is designed to help you understand your health better — from managing daily wellness to providing insights on symptoms, mental health, and medications.
            </Text>

            <Text style={{ color: "#E1EBEE", fontWeight: "bold", marginBottom: 6 }}>What Dr. Tico Can Do</Text>
            <Text style={{ color: "#B0C4DE", marginBottom: 4 }}>🔹 Provide health tips and personalized wellness advice</Text>
            <Text style={{ color: "#B0C4DE", marginBottom: 4 }}>🔹 Analyze symptoms and offer possible insights</Text>
            <Text style={{ color: "#B0C4DE", marginBottom: 4 }}>🔹 Offer mental health guidance and emotional support</Text>
            <Text style={{ color: "#B0C4DE", marginBottom: 4 }}>🔹 Suggest safe and accurate medication information</Text>
            <Text style={{ color: "#B0C4DE", marginBottom: 12 }}>🔹 Analyze images you share (e.g. medication, rashes)</Text>

            <Text style={{ color: "#E1EBEE", fontWeight: "bold", marginBottom: 6 }}>Our Commitment</Text>
            <Text style={{ color: "#B0C4DE", marginBottom: 4 }}>🔒 All your chats are AES-256 encrypted — only you can read them</Text>
            <Text style={{ color: "#B0C4DE", marginBottom: 4 }}>🕵️ Guest mode available — no sign-up required</Text>
            <Text style={{ color: "#B0C4DE", marginBottom: 16 }}>🚫 We never sell your personal or health data</Text>

            <Text style={{ color: "#888", fontSize: 12, fontStyle: "italic", marginBottom: 14 }}>
              ⚠️ Dr. Tico is an AI assistant and is NOT a substitute for professional medical care. Always consult a qualified healthcare professional.
            </Text>

            <Text style={{ color: "#B0C4DE", fontSize: 12, marginBottom: 14 }}>📧 Contact: support@myminidr.com</Text>

            <TouchableOpacity
              onPress={() => setAboutModalVisible(false)}
              style={{ backgroundColor: "#6F00FF", paddingVertical: 10, borderRadius: 20, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Policy & Terms Modal */}
        <Modal
          isVisible={isPolicyModalVisible}
          onBackdropPress={() => setPolicyModalVisible(false)}
          animationIn="fadeIn"
          animationOut="fadeOut"
          style={{ margin: 16 }}
        >
          <View style={{ backgroundColor: "#0d0d1a", borderRadius: 16, padding: 22, maxHeight: "85%" }}>
            <Text style={{ color: "#F0F8FF", fontSize: 20, fontWeight: "bold", marginBottom: 4 }}>🔒 Privacy Policy & Terms</Text>
            <Text style={{ color: "#6495ED", fontSize: 12, marginBottom: 14 }}>Last Updated: September 9, 2026</Text>

            <Text style={{ color: "#E1EBEE", fontWeight: "bold", marginBottom: 6 }}>Privacy Policy</Text>
            <Text style={{ color: "#B0C4DE", marginBottom: 4, lineHeight: 18 }}>• Google Sign-In: we collect your name, email, and profile picture via Firebase Auth.</Text>
            <Text style={{ color: "#B0C4DE", marginBottom: 4, lineHeight: 18 }}>• Guest Mode: fully anonymous — no personal info required.</Text>
            <Text style={{ color: "#B0C4DE", marginBottom: 4, lineHeight: 18 }}>• Chat messages: encrypted with AES-256 before being saved to Firebase. We cannot read your conversations.</Text>
            <Text style={{ color: "#B0C4DE", marginBottom: 4, lineHeight: 18 }}>• Images (optional): processed by Gemini AI in memory — never stored.</Text>
            <Text style={{ color: "#B0C4DE", marginBottom: 4, lineHeight: 18 }}>• We do NOT sell, rent, or share your health data with third parties.</Text>
            <Text style={{ color: "#B0C4DE", marginBottom: 14, lineHeight: 18 }}>• Third-party services: Firebase (Google), Google Gemini AI — each governed by their own policies.</Text>

            <Text style={{ color: "#E1EBEE", fontWeight: "bold", marginBottom: 6 }}>Terms of Service</Text>
            <Text style={{ color: "#B0C4DE", marginBottom: 4, lineHeight: 18 }}>⚠️ MyMiniDr is NOT a medical device. Dr. Tico cannot diagnose, prescribe, or treat any condition. Always consult a licensed healthcare professional. In emergencies, call your local emergency services immediately.</Text>
            <Text style={{ color: "#B0C4DE", marginBottom: 4, lineHeight: 18 }}>• You must be at least 13 years old to use this app.</Text>
            <Text style={{ color: "#B0C4DE", marginBottom: 4, lineHeight: 18 }}>• Personal, non-commercial use only. No reverse-engineering or misuse.</Text>
            <Text style={{ color: "#B0C4DE", marginBottom: 4, lineHeight: 18 }}>• AI responses may not always be accurate — verify important health info with a professional.</Text>
            <Text style={{ color: "#B0C4DE", marginBottom: 14, lineHeight: 18 }}>• The app is provided "as is". We are not liable for health decisions based on AI responses.</Text>

            <Text style={{ color: "#888", fontSize: 12, marginBottom: 14 }}>📧 support@myminidr.com</Text>

            <TouchableOpacity
              onPress={() => setPolicyModalVisible(false)}
              style={{ backgroundColor: "#6F00FF", paddingVertical: 10, borderRadius: 20, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Password Confirmation Modal */}
        <Modal
          isVisible={isPasswordModalVisible}
          backdropOpacity={0.5}
          onBackdropPress={() => setPasswordModalVisible(false)}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Confirm Password</Text>
            <TextInput
              secureTextEntry
              placeholder="Enter Password to delete the account"
              value={passwordInput}
              onChangeText={setPasswordInput}
              style={styles.input}
            />
            <TouchableOpacity onPress={handlePasswordConfirmation}>
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Removed width and maxWidth constraints for full-screen background
    // alignSelf: "center",
  },
  hamburgerMenu: { position: "absolute", top: 30, left: 20, zIndex: 2 },
  hamburgerIcon: { fontSize: 30, color: "#fff" },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 260,
    maxWidth: "80%",
    height: 400,
    margin: 5,
    zIndex: 10,
  },
  cogwheelMenu: {
    position: "absolute",
    top: 30,
    left: 20,
    zIndex: 2,
    backgroundColor: "#002244",
    padding: 10,
    borderRadius: 50,
  },

  cogwheelIcon: {
    borderRadius: 50,
  },

  headerImageContainer: {
    position: "absolute",
    top: 30, // Aligns with the cogwheel
    right: 20, // Adds spacing between the cogwheel and the image
    zIndex: 1,
  },

  headerImage: {
    width: 50,
    height: 50,
  },

  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
    marginTop: 18,
  },
  sidebarText: { marginLeft: 10, color: "#F0F8FF", fontSize: 16 },
  closeSidebar: { position: "absolute", top: 20, right: 20 },
  mainContent: { alignItems: "center", padding: 20, marginTop: 20 },
  welcomeText: { fontSize: 18, color: "#F0F8FF", marginBottom: 20 },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  card1: {
    backgroundColor: "#120A8F",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    flex: 1,
    display: "flex",
    flexDirection: "row",
    gap: 5,
    flexWrap: "wrap",
    opacity: 0.85,
  },
  card2: {
    backgroundColor: "#011F5B",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    flex: 1,
    display: "flex",
    flexDirection: "row",
    gap: 5,
    flexWrap: "wrap",
    opacity: 1,
  },
  cardText: { color: "#F0F8FF", marginTop: 10, fontWeight: "bold" },
  sectionTitle: {
    fontSize: 18,
    color: "#E1EBEE",
    marginVertical: 20,
    alignSelf: "flex-start",
  },
  historyContainer: { width: "100%" },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#2E2787",
    borderRadius: 20,
    opacity: 0.8,
  },
  historyText: { color: "#F0F8FF", marginLeft: 10 },
  modal: { backgroundColor: "#F0F8FF", padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, marginBottom: 10, color: '#AB0003' },
  input: { borderBottomWidth: 1, marginBottom: 20 },
  confirmText: { color: "#F0F8FF", textAlign: "center", backgroundColor:'#AB0003', margin:'auto', width:'50%', padding:5, borderRadius:10, alignSelf:'center' },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#121212",
  },
  loaderContainerChats: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,

  },
  loaderText: { color: "#F0F8FF", marginTop: 10 },
});

export default Home;
