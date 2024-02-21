import React, { useState } from "react";
import { Text, View, TouchableOpacity, Alert, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from "react-native-modal";
import { FIREBASE_AUTH } from "../Firebaseconfig";
import {
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

const Home = () => {
  const navigation = useNavigation();
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const handleExit = () => {
    // Navigate to the Welcome screen without signing out
    navigation.navigate("Welcome");
  };

  const handleLogout = async () => {
    // Clear login state
    await AsyncStorage.removeItem("userToken");
    navigation.navigate("Welcome");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setPasswordModalVisible(true);
          },
        },
      ]
    );
  };

  const handlePasswordConfirmation = async () => {
    try {
      setDeletingAccount(true);

      // Get the current user
      const user = FIREBASE_AUTH.currentUser;

      // Create a credential with the user's email and entered password
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordInput
      );

      // Reauthenticate the user with the credential
      await reauthenticateWithCredential(user, credential);

      // Delete the user's account
      await deleteUser(user);

      // Clear login state
      await AsyncStorage.removeItem("userToken");

      // Navigate to the Welcome screen
      navigation.navigate("Welcome");
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        Alert.alert("Incorrect Password", "Please enter the correct password.");
      } else {
        Alert.alert("Error", "Failed to delete account. Please try again.");
      }
    } finally {
      setDeletingAccount(false);
      setPasswordModalVisible(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Wassup Dawg</Text>
      <TouchableOpacity onPress={handleExit} style={{ marginTop: 20 }}>
        <Text style={{ color: "green" }}>Exit</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout} style={{ marginTop: 20 }}>
        <Text style={{ color: "blue" }}>Logout</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleDeleteAccount}
        style={{ marginTop: 20 }}
        disabled={deletingAccount}
      >
        <Text style={{ color: "red" }}>
          {deletingAccount ? "Deleting Account..." : "Delete Account"}
        </Text>
      </TouchableOpacity>

      {/* Password Re-entry Modal */}
      <Modal isVisible={isPasswordModalVisible}>
        <View
          style={{ backgroundColor: "white", padding: 20, borderRadius: 10 }}
        >
          <Text>Re-enter your password to confirm</Text>
          <TextInput
            secureTextEntry
            placeholder="Password"
            value={passwordInput}
            onChangeText={(text) => setPasswordInput(text)}
            style={{ borderBottomWidth: 1, marginBottom: 20 }}
          />
          <TouchableOpacity onPress={handlePasswordConfirmation}>
            <Text style={{ color: "blue" }}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default Home;
