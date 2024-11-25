import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import * as GoogleGenerativeAI from "@google/generative-ai";
import { launchImageLibrary } from "react-native-image-picker"; // Importing the image picker

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const API_KEY = "AIzaSyAQzJer7LGPAp8kkG8JOjrsrfY9PjWd7hc"; // Add your Gemini API Key here.

  useEffect(() => {
    const welcomeMessage = async () => {
      const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(
        "Welcome to Health Assistant Chat! I can help with health tips, diagnosis based on symptoms, psychological advice, and suggesting medications."
      );
      const responseText = result.response.text();

      setMessages([
        {
          text: responseText,
          type: "bot",
        },
      ]);
    };

    welcomeMessage();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, type: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const healthContext =
        "You are a health assistant chatbot. Provide health tips, diagnosis based on symptoms, psychological advice, and suggest medications where relevant. Only answer health-related queries.";
      const result = await model.generateContent(`${healthContext}\n${input}`);
      const responseText = result.response.text();

      setMessages((prev) => [...prev, { text: responseText, type: "bot" }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "Error: Unable to fetch response. Please try again.", type: "bot" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = () => {
    launchImageLibrary(
      {
        mediaType: "photo", // Limit to images
        quality: 1,
        includeBase64: false, // Base64 encoding can be enabled if needed
      },
      (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
          return;
        }
        if (response.errorCode) {
          console.error("Image Picker Error: ", response.errorMessage);
          return;
        }

        const imageUri = response.assets[0].uri; // Get the image URI
        setMessages((prev) => [
          ...prev,
          { text: "Image uploaded successfully. Analyzing...", type: "bot" },
        ]);

        // Placeholder for image analysis logic
        setMessages((prev) => [
          ...prev,
          {
            text: "Image analysis feature is in development. Stay tuned!",
            type: "bot",
          },
        ]);
      }
    );
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.type === "user" ? styles.userMessage : styles.botMessage,
      ]}
    >
      <View style={styles.messageBubble}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={{ uri: "https://example.com/bot-avatar.png" }} // Replace with actual bot avatar
            style={styles.botAvatar}
          />
          <View>
            <Text style={styles.botName}>Health Assistant</Text>
            <Text style={styles.onlineStatus}>Online</Text>
          </View>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.messagesList}
      />

      {/* Input Section */}
      <View style={styles.inputSection}>
        <TouchableOpacity style={styles.iconButton} onPress={handleImageUpload}>
          <FontAwesome name="picture-o" size={24} color="#fff" />
        </TouchableOpacity>
        <TextInput
          value={input}
          onChangeText={(text) => setInput(text)}
          placeholder="Ask about your health..."
          placeholderTextColor="#aaa"
          style={styles.input}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading}>
          <Icon name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1E1E1E" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    backgroundColor: "#262626",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  botAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  botName: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  onlineStatus: { color: "#4CAF50", fontSize: 12 },
  messagesList: { flexGrow: 1, paddingHorizontal: 15, paddingTop: 10 },
  messageContainer: { marginVertical: 8, flexDirection: "row", justifyContent: "flex-start" },
  messageBubble: {
    maxWidth: "70%",
    backgroundColor: "#333",
    borderRadius: 20,
    padding: 10,
  },
  messageText: { color: "#fff", fontSize: 14 },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#4CAF50",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#333",
  },
  inputSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
    backgroundColor: "#262626",
  },
  iconButton: { marginHorizontal: 10 },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: "#333",
    color: "#fff",
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    padding: 10,
    marginLeft: 10,
  },
});

export default ChatScreen;
