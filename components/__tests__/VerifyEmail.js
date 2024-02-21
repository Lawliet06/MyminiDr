import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FIREBASE_AUTH } from "../../Firebaseconfig";
import {
  sendEmailVerification,
  reload,
  onAuthStateChanged,
} from "firebase/auth";

const VerifyEmail = ({ route, navigation }) => {
  const { email } = route.params;
  const [user, setUser] = useState(FIREBASE_AUTH.currentUser);
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let timer;
    if (resendDisabled && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (resendDisabled) {
      setResendDisabled(false);
      setCountdown(60);
    }

    return () => clearTimeout(timer);
  }, [resendDisabled, countdown]);

  const handleResendVerification = async () => {
    if (!user) {
      console.error("User is not logged in.");
      return;
    }

    setLoading(true);
    try {
      // Resend verification email logic
      await sendEmailVerification(user);

      // Reload the user to get the updated email verification status
      await reload(user);

      // Provide feedback to the user
      alert("Verification email resent! Please check your email.");
      setResendDisabled(true);
    } catch (error) {
      if (error.code === "auth/too-many-requests") {
        alert(
          "Too many requests. Please wait a moment before resending the verification email."
        );
      } else {
        alert("Error resending verification email. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <View>
        <Text style={{ fontSize: 20, marginBottom: 20 }}>
          Please verify your email address:
        </Text>
        <Text style={{ marginBottom: 20 }}>
          We've sent a verification email to {email}. Please check your inbox
          and follow the instructions to complete the registration process.
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color="#AD40AF" />
        ) : (
          <View>
            <TouchableOpacity
              onPress={handleResendVerification}
              disabled={resendDisabled}
            >
              <Text style={{ color: "#AD40AF", fontWeight: "700" }}>
                Resend Verification Email
              </Text>
            </TouchableOpacity>
            {resendDisabled && (
              <Text style={{ marginTop: 10 }}>
                Resend available in {countdown} seconds
              </Text>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default VerifyEmail;
