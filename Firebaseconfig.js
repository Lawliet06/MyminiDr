import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: {Add_apikey_here},
  authDomain: "my-mini-dr.firebaseapp.com",
  projectId: "my-mini-dr",
  storageBucket: "my-mini-dr.appspot.com",
  messagingSenderId: "320612794855",
  appId: {Add_appid_here},
  measurementId: "G-LFFPYPP3CB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { app as FIREBASE_APP, firestore as FIREBASE_DB, auth as FIREBASE_AUTH };
