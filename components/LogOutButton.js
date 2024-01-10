

import React from 'react';
import { Button, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

const SignOutButton = () => {
  const handleSignOut = async () => {
    try {
      await auth().signOut();
      // Optionally, you can navigate to a different screen or perform other actions after successful sign-out
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
