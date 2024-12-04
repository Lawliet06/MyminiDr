import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import * as GoogleGenerativeAI from "@google/generative-ai";
import { launchImageLibrary } from "react-native-image-picker";
import RNFetchBlob from "rn-fetch-blob";
import { FIREBASE_DB } from "../Firebaseconfig";
import { collection, addDoc, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const ChatScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const flatListRef = useRef(null);

  // Extract chat ID from route params, prioritizing different possible sources
  const initialChatId =
    route.params?.chatId || route.params?.chatData?.id || route.params?.id;
  const userId = getAuth().currentUser.uid;

  const TEXT_API_KEY = "AIzaSyAQzJer7LGPAp8kkG8JOjrsrfY9PjWd7hc";
  const VISION_API_KEY = "AIzaSyDnUzQV5SMKTh6CQ2zVTNtj0waBd0dXYPQ";
  const VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`;

  useEffect(() => {
    console.log("Initial Render - ChatScreen");
    console.log("Full Route Object:", JSON.stringify(route, null, 2));
    console.log("Full Route Params:", JSON.stringify(route.params, null, 2));
    
    const loadChatHistory = async () => {
      try {
        // Check for chat data in nested params
        const passedChatData = route.params?.params?.chatData || route.params?.chatData;
        
        console.log("Passed Chat Data:", JSON.stringify(passedChatData, null, 2));
        
        if (passedChatData) {
          console.log("Loading chat from passed data:", JSON.stringify(passedChatData, null, 2));
          
          // Set messages from the passed chat data
          if (passedChatData.messages && passedChatData.messages.length > 0) {
            setMessages(passedChatData.messages);
            setCurrentChatId(passedChatData.id);
            return;
          }
        }
  
        // If no passed data, fall back to creating welcome message
        await createWelcomeMessage();
      } catch (error) {
        console.error("Error loading chat history:", error);
        Alert.alert("Error", "Could not load chat history");
        await createWelcomeMessage();
      }
    };

    const createWelcomeMessage = async () => {
      try {
        console.log("Creating welcome message");
        const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(TEXT_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(
          "Welcome to Health Assistant Chat! I can help with health tips, diagnosis based on symptoms, psychological advice, and suggesting medications."
        );
        const responseText = result.response.text();

        const welcomeMessage = { text: responseText, type: "bot" };
        setMessages([welcomeMessage]);
        console.log("Welcome message created");
      } catch (error) {
        console.error("Error creating welcome message:", error);
      }
    };

    loadChatHistory();
  }, [initialChatId, userId]);

  const saveChatToFirestore = async (updatedMessages) => {
    try {
      const currentUser = getAuth().currentUser;
      if (!currentUser) {
        console.error("No user is logged in.");
        return null;
      }

      const userId = currentUser.uid;

      if (currentChatId) {
        // Update existing chat
        const chatRef = doc(
          FIREBASE_DB,
          "users",
          userId,
          "chats",
          currentChatId
        );
        await setDoc(
          chatRef,
          {
            messages: updatedMessages,
            title:
              updatedMessages[0]?.text?.split(" ").slice(0, 5).join(" ") ||
              "Untitled Chat",
          },
          { merge: true }
        );
        return currentChatId;
      } else {
        // Create new chat
        const newChatRef = await addDoc(
          collection(FIREBASE_DB, "users", userId, "chats"),
          {
            messages: updatedMessages,
            title:
              updatedMessages[0]?.text?.split(" ").slice(0, 5).join(" ") ||
              "Untitled Chat",
          }
        );
        setCurrentChatId(newChatRef.id);
        return newChatRef.id;
      }
    } catch (error) {
      console.error("Error saving chat to Firestore:", error);
      return null;
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !imageUri) return;

    console.log("Sending message");
    console.log("Current Chat ID before send:", currentChatId);

    const userMessage = {
      text: input,
      type: "user",
      imageUri,
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setImageUri(null);
    setLoading(true);

    try {
      let visionResult = "";
      if (imageUri) {
        const base64Image = await RNFetchBlob.fs.readFile(imageUri, "base64");
        const visionResponse = await fetch(VISION_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [
              {
                image: { content: base64Image },
                features: [{ type: "LABEL_DETECTION", maxResults: 5 }],
              },
            ],
          }),
        });

        const visionData = await visionResponse.json();
        const labels = visionData.responses[0]?.labelAnnotations || [];
        visionResult = labels.map((label) => label.description).join(", ");
      }

      const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(TEXT_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const healthContext =
        "You are a health assistant chatbot. Provide health tips, diagnosis based on symptoms, psychological advice, and suggest medications where relevant. Analyze images and include their insights.";
      const prompt = `${healthContext}\nUser input: ${input}\nImage analysis: ${visionResult}`;
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const botMessage = { text: responseText, type: "bot" };
      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);

      // Save chat and get the chat ID
      const savedChatId = await saveChatToFirestore(finalMessages);

      console.log("Saved Chat ID:", savedChatId);
    } catch (error) {
      console.error("Error handling message:", error);
      const errorMessage = {
        text: "Error: Unable to fetch response. Please try again.",
        type: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };

  const handleImageUpload = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: "photo",
        quality: 1,
      });

      if (result.didCancel || result.errorCode) {
        console.log("Image selection cancelled or failed");
        return;
      }

      if (result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.type === "user" ? styles.userMessage : styles.botMessage,
      ]}
    >
      {item.imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUri }} style={styles.messageImage} />
        </View>
      )}
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
            source={{ uri: "https://example.com/bot-avatar.png" }}
            style={styles.botAvatar}
          />
          <View>
            <Text style={styles.botName}>Health Assistant</Text>
            <Text style={styles.onlineStatus}>Online</Text>
          </View>
        </View>
      </View>

      <FlatList
        ref={flatListRef} // Attach the FlatList reference
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      {imageUri && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={handleRemoveImage}
          >
            <FontAwesome name="remove" size={24} color="red" />
          </TouchableOpacity>
        </View>
      )}

      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loaderText}>Diagnosing...</Text>
        </View>
      )}

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
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={loading}
        >
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
  messageContainer: { marginVertical: 8 },
  messageBubble: {
    maxWidth: "70%",
    backgroundColor: "#333",
    borderRadius: 20,
    padding: 10,
  },
  messageText: { color: "#fff", fontSize: 14 },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 5,
  },
  userMessage: { alignSelf: "flex-end" },
  botMessage: { alignSelf: "flex-start" },
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
  imagePreviewContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 15,
    marginBottom: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removeImageButton: { padding: 10 },
  loaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
  },
  loaderText: {
    color: "#4CAF50",
    marginLeft: 10,
  },
});

export default ChatScreen;
