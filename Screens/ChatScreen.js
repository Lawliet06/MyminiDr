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
import { launchImageLibrary } from "react-native-image-picker";
import RNFetchBlob from 'rn-fetch-blob';  // Import rn-fetch-blob

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const TEXT_API_KEY = "AIzaSyAQzJer7LGPAp8kkG8JOjrsrfY9PjWd7hc"; // API Key for text generation
  const VISION_API_KEY = "AIzaSyDnUzQV5SMKTh6CQ2zVTNtj0waBd0dXYPQ"; // API Key for Vision API
  const VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate?key=" + VISION_API_KEY;

  useEffect(() => {
    const welcomeMessage = async () => {
      const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(TEXT_API_KEY);
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
      const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(TEXT_API_KEY);
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

  const handleImageUpload = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: "photo", // Allow photo selection
        quality: 1, // High-quality images
      });
  
      if (result.didCancel) {
        console.log("User cancelled image picker");
        return;
      }
  
      if (result.errorCode) {
        console.error("Image Picker Error: ", result.errorMessage);
        return;
      }
  
      if (result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri; // Extract image URI
        console.log("Selected Image URI: ", imageUri);
  
        setMessages((prev) => [
          ...prev,
          { text: "Image uploaded successfully. Analyzing...", type: "bot" },
        ]);
  
        // Use rn-fetch-blob to read the image and convert it to base64
        const base64Image = await RNFetchBlob.fs.readFile(imageUri, 'base64');
        console.log("Base64 Encoded Image: ", base64Image); // Log the base64 string
  
        // Send the image to Google Vision API
        const visionResponse = await fetch(VISION_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: base64Image, // Sending base64 encoded image
                },
                features: [
                  {
                    type: "LABEL_DETECTION", // Feature to detect labels
                    maxResults: 5, // Max number of results you want
                  },
                ],
              },
            ],
          }),
        });
  
        // Log the response from the Vision API
        const visionData = await visionResponse.json();
        console.log("Google Vision API Response: ", visionData);
  
        if (visionData.error) {
          console.error("Vision API Error: ", visionData.error);
          throw new Error("Error analyzing image with Vision API");
        }
  
        const labels = visionData.responses[0].labelAnnotations || [];
        const description = labels
          .map((label) => label.description)
          .join(", ");
        setMessages((prev) => [
          ...prev,
          { text: `Image analysis result: ${description}`, type: "bot" },
        ]);
      }
    } catch (error) {
      console.error("Error launching image library or analyzing image: ", error);
      setMessages((prev) => [
        ...prev,
        { text: "Error: Unable to analyze image. Please try again.", type: "bot" },
      ]);
    }
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

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.messagesList}
      />

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
    backgroundColor: "#444",
    color: "#fff",
    paddingLeft: 15,
  },
  sendButton: { marginLeft: 10 },
});

export default ChatScreen;
