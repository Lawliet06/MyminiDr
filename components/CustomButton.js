import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

export default function CustomButton({ label, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#AD40AF",
        borderRadius: 10,
        padding: 20,
        marginBottom: 30,
      }}
    >
      <Text
        style={{
          textAlign: "center",
          fontWeight: "700",
          fontSize: 16,
          color: "#fff",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
