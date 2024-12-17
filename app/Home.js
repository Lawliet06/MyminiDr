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
} from "firebase/auth";
import {
  collection,
  getDocs,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

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

  const handleExit = () => navigation.navigate("Welcome");

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    navigation.navigate("Welcome");
  };

  const handleDeleteAccount = () => {
    setPasswordModalVisible(true);
  };

  const handlePasswordConfirmation = async () => {
    try {
      setDeletingAccount(true);
      const user = FIREBASE_AUTH.currentUser;
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
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) {
        console.log("No user logged in");
        setIsLoadingChats(false);
        return;
      }


      const chatsRef = collection(FIREBASE_DB, `users/${userId}/chats`);

      const unsubscribe = onSnapshot(
        chatsRef,
        (querySnapshot) => {
          const chats = [];
          querySnapshot.forEach((doc) => {
            const chatData = doc.data();

            const firstUserMessage = chatData.messages?.find(
              (msg) => msg.type === "user"
            );
            const title = firstUserMessage
              ? firstUserMessage.text.split(" ").slice(0, 5).join(" ")
              : `Chat ${chats.length + 1}`;

            // Add timestamp to help with sorting
            chats.push({
              id: doc.id,
              title,
              ...chatData,
              timestamp: chatData.timestamp || Date.now(), // Use existing timestamp or current time
            });
          });

          // Sort chats in reverse chronological order (latest first)
          const sortedChats = chats.sort(
            (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
          );

          setChatHistory(sortedChats);
          setIsLoadingChats(false);
        },
        (error) => {
          console.error("Error listening to chat history:", error);
          setIsLoadingChats(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Error fetching chat history:", error);
      setIsLoadingChats(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const currentUser = FIREBASE_AUTH.currentUser;
      if (!currentUser) return;

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
          // If no name found, use email or default
          setUserName(currentUser.email?.split("@")[0] || "User");
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Fallback to email or default name
      const currentUser = FIREBASE_AUTH.currentUser;
      setUserName(currentUser?.email?.split("@")[0] || "User");
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchUserData();
      await fetchChatHistory();
      setIsLoading(false);
    };

    initialize();

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
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
      }}
    >
      <View style={styles.container}>
        <Modal
          isVisible={isSidebarVisible}
          backdropOpacity={0.5} // Darkens the area outside the sidebar
          onBackdropPress={() => setSidebarVisible(false)} // Close when backdrop is pressed
          animationIn="slideInLeft"
          animationOut="slideOutLeft"
          style={{ margin: 0, justifyContent: "flex-start" }} // Align sidebar to the left
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
                  onPress={handleExit}
                  style={styles.sidebarItem}
                >
                  <Icon name="question-circle" size={18} color="#fff" />
                  <Text style={styles.sidebarText}>About us</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleExit}
                  style={styles.sidebarItem}
                >
                  <Icon name="lock" size={18} color="#fff" />
                  <Text style={styles.sidebarText}>Policy & terms</Text>
                </TouchableOpacity>
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
                    {deletingAccount ? "Deleting..." : "Delete Account"}
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
          <Text style={styles.welcomeText}>Welcome {userName}!</Text>
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
  container: { flex: 1, position: "relative" },
  hamburgerMenu: { position: "absolute", top: 30, left: 20, zIndex: 2 },
  hamburgerIcon: { fontSize: 30, color: "#fff" },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "60%",
    height: "37%",
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
    justifyContent: "space-around",
    width: "100%",
  },
  card1: {
    backgroundColor: "#120A8F",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    width: "45%",
    display: "flex",
    flexDirection: "row",
    gap: 5,
    flexWrap: "wrap",
    opacity: 0.8,
  },
  card2: {
    backgroundColor: "#011F5B",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    width: "45%",
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
