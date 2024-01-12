import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCrzla-YYpHjnQgLcsispJmPcPdFp8f72I",
  authDomain: "my-mini-dr.firebaseapp.com",
  projectId: "my-mini-dr",
  storageBucket: "my-mini-dr.appspot.com",
  messagingSenderId: "320612794855",
  appId: "1:320612794855:web:41a12febae93e9c2363d42",
  measurementId: "G-LFFPYPP3CB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { app as FIREBASE_APP, firestore as FIREBASE_DB, auth as FIREBASE_AUTH };
