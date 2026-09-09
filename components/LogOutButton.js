

import React from 'react';
import { Button, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { FIREBASE_AUTH } from '../Firebaseconfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignOutButton = () => {
  const handleSignOut = async () => {
    try {
      await signOut(FIREBASE_AUTH);
      await AsyncStorage.removeItem('userToken');
      console.log('User signed out');
    } catch (error) {
      Alert.alert('Sign Out Error', error.message);
    }
  };

  return (
    <Button title="Sign Out" onPress={handleSignOut} />
  );
};

export default SignOutButton;
