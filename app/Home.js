import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from "react-native-modal";
import Icon from "react-native-vector-icons/FontAwesome"; // For icons
import { FIREBASE_AUTH } from "../Firebaseconfig";
import {
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

const Home = () => {
  const navigation = useNavigation();
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

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
      const credential = EmailAuthProvider.credential(user.email, passwordInput);
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

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      {isSidebarVisible && (
        <View style={styles.sidebar}>
          <TouchableOpacity onPress={handleExit} style={styles.sidebarItem}>
            <Icon name="sign-out" size={18} color="#fff" />
            <Text style={styles.sidebarText}>Exit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.sidebarItem}>
            <Icon name="power-off" size={18} color="#fff" />
            <Text style={styles.sidebarText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeleteAccount}
            style={styles.sidebarItem}
            disabled={deletingAccount}
          >
            <Icon name="trash" size={18} color="#fff" />
            <Text style={styles.sidebarText}>
              {deletingAccount ? "Deleting..." : "Delete Account"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeSidebar}
            onPress={() => setSidebarVisible(false)}
          >
            <Icon name="times" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Hamburger Menu Button */}
      <TouchableOpacity
        style={styles.hamburgerMenu}
        onPress={() => setSidebarVisible(true)}
      >
        <Text style={styles.hamburgerIcon}>☰</Text>
      </TouchableOpacity>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        <Text style={styles.welcomeText}>Welcome, User!</Text>
        <View style={styles.cardsContainer}>
          {/* Chat Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("ChatScreen")} // Replace with actual navigation or logic
          >
            <Icon name="comment" size={50} color="#4CAF50" />
            <Text style={styles.cardText}>Chat with Simy</Text>
          </TouchableOpacity>

          {/* Talk Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("ChatScreen")} // Replace with actual navigation or logic
          >
            <Icon name="microphone" size={50} color="#2196F3" />
            <Text style={styles.cardText}>Talk with Simy</Text>
          </TouchableOpacity>
        </View>

        {/* History Section */}
        <Text style={styles.sectionTitle}>History</Text>
        <ScrollView style={styles.historyContainer}>
          {[
            "Color recommendation for Finance app",
            "5 slogan for travel website",
            "Fitness app for everyone",
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.historyItem}
              onPress={() => alert(`Clicked on: ${item}`)} // Replace with actual navigation or logic
            >
              <Icon name="clock-o" size={18} color="#fff" />
              <Text style={styles.historyText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>

      {/* Password Confirmation Modal */}
      <Modal isVisible={isPasswordModalVisible} backdropOpacity={0.5}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Confirm Password</Text>
          <TextInput
            secureTextEntry
            placeholder="Enter Password"
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
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", position: "relative" },
  hamburgerMenu: { position: "absolute", top: 20, left: 20, zIndex: 2 },
  hamburgerIcon: { fontSize: 30, color: "#fff" },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "60%",
    height: "100%",
    backgroundColor: "#333",
    padding: 20,
    zIndex: 10,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sidebarText: { marginLeft: 10, color: "#fff", fontSize: 16 },
  closeSidebar: { position: "absolute", top: 20, right: 20 },
  mainContent: { alignItems: "center", padding: 20, marginTop: 80 },
  welcomeText: { fontSize: 24, color: "#fff", marginBottom: 20 },
  cardsContainer: { flexDirection: "row", justifyContent: "space-around", width: "100%" },
  card: {
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "40%",
  },
  cardText: { color: "#fff", marginTop: 10 },
  sectionTitle: { fontSize: 20, color: "#fff", marginVertical: 20, alignSelf: "flex-start" },
  historyContainer: { width: "100%" },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
  },
  historyText: { color: "#fff", marginLeft: 10 },
  modal: { backgroundColor: "#fff", padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 18, marginBottom: 10 },
  input: { borderBottomWidth: 1, marginBottom: 20 },
  confirmText: { color: "blue", textAlign: "center" },
});

export default Home;
