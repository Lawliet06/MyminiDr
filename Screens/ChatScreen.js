import React, { useState } from "react";
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

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, type: "user" }]);
      setInput("");
    }
  };

  const renderMessage = ({ item }) => {
    return (
      <View
        style={[
          styles.messageContainer,
          item.type === "user" ? styles.userMessage : styles.botMessage,
        ]}
      >
        {item.type === "user" && (
          <View style={styles.avatar}>
            <FontAwesome name="user" size={20} color="#fff" />
          </View>
        )}
        <View style={styles.messageBubble}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
      </View>
    );
  };

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
            <Text style={styles.botName}>Twinkle Bot</Text>
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
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="picture-o" size={24} color="#fff" />
        </TouchableOpacity>
        <TextInput
          value={input}
          onChangeText={(text) => setInput(text)}
          placeholder="Ask me something..."
          placeholderTextColor="#aaa"
          style={styles.input}
        />
        <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
          <FontAwesome name="microphone" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Icon name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    backgroundColor: "#262626",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  botName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  onlineStatus: {
    color: "#4CAF50",
    fontSize: 12,
  },
  messagesList: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 8,
  },
  userMessage: {
    justifyContent: "flex-start",
  },
  botMessage: {
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "70%",
    backgroundColor: "#333",
    borderRadius: 20,
    padding: 10,
    marginLeft: 10,
  },
  messageText: {
    color: "#fff",
    fontSize: 14,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  inputSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
    backgroundColor: "#262626",
  },
  iconButton: {
    marginHorizontal: 10,
  },
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
