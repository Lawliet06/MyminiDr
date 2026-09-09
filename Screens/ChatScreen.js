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
  ImageBackground,
  Platform,
} from "react-native";
import { MaterialIcons as Icon, FontAwesome } from "@expo/vector-icons";
import * as GoogleGenerativeAI from "@google/generative-ai";
import { FIREBASE_DB } from "../Firebaseconfig";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  encryptMessages,
  decryptChatDocument,
  decryptData,
} from "../services/encryption";

const ChatScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const flatListRef = useRef(null);

  // Safely retrieve user ID or fallback
  const authUser = getAuth().currentUser;
  const [userId, setUserId] = useState(authUser?.uid || "guest");

  useEffect(() => {
    const resolveUser = async () => {
      if (authUser?.uid) {
        setUserId(authUser.uid);
      } else {
        const guestId = await AsyncStorage.getItem("guestUserId");
        if (guestId) {
          setUserId(guestId);
        }
      }
    };
    resolveUser();
  }, [authUser]);

  const TEXT_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const VISION_API_KEY = process.env.EXPO_PUBLIC_VISION_API_KEY;
  const VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`;

  // Helper to obtain a Gemini model, trying newer Flash models first
  const GEMINI_MODELS = [
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.7-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
  ];

  // Returns true if an error is an overload / high-demand / quota error
  const isOverloadError = (err) => {
    const msg = (err?.message || "").toLowerCase();
    return (
      msg.includes("overloaded") ||
      msg.includes("high demand") ||
      msg.includes("503") ||
      msg.includes("429") ||
      msg.includes("resource_exhausted") ||
      msg.includes("too many requests") ||
      msg.includes("quota") ||
      (err?.status && [429, 503].includes(err.status))
    );
  };

  // Tries generateContent on each model in order; silently skips on overload errors
  const generateWithFallback = async (contentParts) => {
    const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(TEXT_API_KEY);
    let lastError = null;
    for (const modelName of GEMINI_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        console.log(`Trying model: ${modelName}`);
        const result = await model.generateContent(contentParts);
        return result; // success — return immediately
      } catch (err) {
        if (isOverloadError(err)) {
          console.warn(`Model ${modelName} overloaded, trying next...`);
          lastError = err;
          continue; // silent fallback to next model
        }
        throw err; // non-overload error — propagate normally
      }
    }
    // All models exhausted
    throw lastError || new Error("All models unavailable. Please try again later.");
  };

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const passedChatData =
          route.params?.params?.chatData || route.params?.chatData;

        if (passedChatData) {
          // Decrypt messages if needed
          let loadedMessages = passedChatData.messages;
          if (passedChatData.encryptedPayload) {
            loadedMessages = decryptChatDocument(passedChatData, userId);
          }

          if (loadedMessages && loadedMessages.length > 0) {
            setMessages(loadedMessages);
            setCurrentChatId(passedChatData.id || route.params?.chatId);
            return;
          }
        }

        // Check local storage for guest chat cache if applicable
        if (route.params?.chatId) {
          const cached = await AsyncStorage.getItem(`chat_${route.params.chatId}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            const decrypted = decryptChatDocument(parsed, userId);
            if (decrypted.length > 0) {
              setMessages(decrypted);
              setCurrentChatId(route.params.chatId);
              return;
            }
          }
        }

        // If no passed data, generate welcome message
        await createWelcomeMessage();
      } catch (error) {
        console.error("Error loading chat history:", error);
        await createWelcomeMessage();
      }
    };

    const createWelcomeMessage = async () => {
      try {
        const model = getGeminiModel();
        const responseText = result?.response?.text?.() || '';
        if (!responseText) {
          throw new Error('Empty welcome response from Gemini model');
        }
        const welcomeMessage = { text: responseText, type: "bot" };
        setMessages([welcomeMessage]);
      } catch (error) {
        console.error("Error creating welcome message:", error);
        setMessages([
          {
            text: "Hello! I'm Dr. Tico, your AI health assistant. How are you feeling today?",
            type: "bot",
          },
        ]);
      }
    };

    loadChatHistory();
  }, [route.params?.chatId, userId]);

  const saveChatToFirestore = async (updatedMessages) => {
    try {
      const currentUser = getAuth().currentUser;
      const currentUserId = currentUser?.uid || "guest";

      // Find first user message for title
      const firstUserMessage = updatedMessages.find(
        (msg) => msg.type === "user"
      );
      const plainTitle = firstUserMessage
        ? firstUserMessage.text.split(" ").slice(0, 5).join(" ")
        : "Untitled Chat";

      // AES Encrypt the messages payload only; title stays plain for display
      const encryptedPayload = encryptMessages(updatedMessages, currentUserId);

      const docData = {
        encryptedPayload,
        title: plainTitle,
        isEncrypted: true,
        timestamp: Date.now(),
        updatedAt: new Date().toISOString(),
      };

      let chatId = currentChatId;

      if (currentUser) {
        if (currentChatId) {
          const chatRef = doc(
            FIREBASE_DB,
            "users",
            currentUserId,
            "chats",
            currentChatId
          );
          await setDoc(chatRef, docData, { merge: true });
        } else {
          const newChatRef = await addDoc(
            collection(FIREBASE_DB, "users", currentUserId, "chats"),
            docData
          );
          chatId = newChatRef.id;
          setCurrentChatId(newChatRef.id);
        }
      }

      // Also persist to encrypted local storage
      if (chatId) {
        await AsyncStorage.setItem(
          `chat_${chatId}`,
          JSON.stringify(docData)
        );
      }

      return chatId;
    } catch (error) {
      console.error("Error saving encrypted chat:", error);
      return null;
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !imageUri) return;

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
      const healthContext =
        "You are Dr. Tico, an AI health assistant. Provide health tips, diagnosis based on symptoms, psychological advice, and suggest medications where relevant. If an image is provided, analyze it carefully and include your observations. Never say you are not qualified to give medical advice.";

      // Build the content parts for Gemini
      const contentParts = [];

      // If image attached, convert to base64 and add as inlineData part
      if (imageUri) {
        let base64Image = "";
        let mimeType = "image/jpeg";

        if (imageUri.startsWith("data:")) {
          // Already a data URI (web file picker)
          const [header, data] = imageUri.split(",");
          base64Image = data;
          const mimeMatch = header.match(/data:(.*);base64/);
          if (mimeMatch) mimeType = mimeMatch[1];
        } else if (Platform.OS === "web") {
          const res = await fetch(imageUri);
          const blob = await res.blob();
          mimeType = blob.type || "image/jpeg";
          base64Image = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const resUrl = reader.result;
              resolve(resUrl.includes(",") ? resUrl.split(",")[1] : resUrl);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } else {
          try {
            const RNFetchBlob = require("rn-fetch-blob").default;
            base64Image = await RNFetchBlob.fs.readFile(imageUri, "base64");
          } catch (e) {
            console.warn("Could not read image using RNFetchBlob:", e);
          }
        }

        if (base64Image) {
          contentParts.push({
            inlineData: { mimeType, data: base64Image },
          });
        }
      }

      // Add the text prompt
      contentParts.push({
        text: `${healthContext}\nUser: ${input || "(attached image — please analyze it)"}`,
      });

      // Generate response using Gemini multimodal — auto-fallback on overload
      const result = await generateWithFallback(contentParts);

      // Extract response text
      let responseText = "";
      try {
        const response = await result.response;
        if (response && typeof response.text === "function") {
          responseText = await response.text();
        }
      } catch (e) {
        console.warn("Error extracting response text:", e);
      }
      if (!responseText && result?.candidates?.[0]?.content?.parts?.[0]?.text) {
        responseText = result.candidates[0].content.parts[0].text;
      }
      if (!responseText) {
        responseText = "Sorry, I couldn't generate a response at this time.";
      }

      const botMessage = { text: responseText, type: "bot" };
      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);

      await saveChatToFirestore(finalMessages);
    } catch (error) {
      console.error("Error handling message:", error);
      const detailedMsg = error?.message
        ? `Error: ${error.message}`
        : "Error: Unable to fetch response. Please try again.";
      setMessages((prev) => [...prev, { text: detailedMsg, type: "bot" }]);
    } finally {
      setLoading(false);
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };

  const handleImageUpload = async () => {
    try {
      if (Platform.OS === "web") {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.onchange = (e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              setImageUri(event.target.result);
            };
            reader.readAsDataURL(file);
          }
        };
        fileInput.click();
        return;
      }

      // Native platform
      const { launchImageLibrary } = require("react-native-image-picker");
      const result = await launchImageLibrary({
        mediaType: "photo",
        quality: 0.8,
      });

      if (result.didCancel || result.errorCode) {
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
    <ImageBackground source={require('../assets/images/bg6.jpg')} style={{
      flex: 1,
      width: "100%",
      height: "100%",
    }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require('../assets/images/hd1.png')}
              style={styles.botAvatar}
            />
            <View>
              <Text style={styles.botName}>Dr Tico</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                <Text style={styles.onlineStatus}>Online</Text>
                <Text style={{ color: "#888", fontSize: 11, marginHorizontal: 4 }}>•</Text>
                <Icon name="lock" size={11} color="#4CAF50" />
                <Text style={{ color: "#4CAF50", fontSize: 11, marginLeft: 2 }}>Encrypted</Text>
              </View>
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
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    justifyContent: "flex-start",
    width: "100%",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
    marginRight: 15,
  },
  botName: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  onlineStatus: { color: "#4CAF50", fontSize: 12 },
  messagesList: { flexGrow: 1, paddingHorizontal: 15, paddingTop: 10 },
  messageContainer: { marginVertical: 8 },
  messageBubble: {
    maxWidth: "75%",
    backgroundColor: "#2E2787",
    borderRadius: 20,
    padding: 12,
  },
  messageText: { color: "#E1EBEE", fontSize: 14, lineHeight: 20 },
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
    backgroundColor: "black",
    width: "100%",
    alignSelf: "center",
  },
  iconButton: { marginHorizontal: 10 },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#002244",
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
