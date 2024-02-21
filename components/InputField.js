import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InputField({
  label,
  icon,
  inputType,
  keyboardType,
  fieldButtonLabel,
  fieldButtonFunction,
  onChangeText,
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <View
      style={{
        flexDirection: "row",
        borderBottomColor: "#ccc",
        borderBottomWidth: 1,
        paddingBottom: 8,
        marginBottom: 25,
      }}
    >
      {icon}
      {inputType === "password" ? (
        <>
          <TextInput
            placeholder={label}
            keyboardType={keyboardType}
            style={{ flex: 1, paddingVertical: 0 }}
            secureTextEntry={!isPasswordVisible}
            onChangeText={onChangeText}
            required
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Ionicons
              name={isPasswordVisible ? "eye" : "eye-off"}
              size={19}
              color="#AD40AF"
              style={{ marginTop: 5, marginLeft: 5 }}
            />
          </TouchableOpacity>
        </>
      ) : (
        <TextInput
          placeholder={label}
          keyboardType={keyboardType}
          style={{ flex: 1, paddingVertical: 0 }}
          onChangeText={onChangeText}
          required
        />
      )}
      <TouchableOpacity onPress={fieldButtonFunction}>
        <Text style={{ color: "#AD40AF", fontWeight: "700"}}>
          {fieldButtonLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
