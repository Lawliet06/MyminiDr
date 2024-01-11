import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider } from 'firebase/auth';


import {getAuth} from 'firebase/auth';
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyCrzla-YYpHjnQgLcsispJmPcPdFp8f72I",
  authDomain: "my-mini-dr.firebaseapp.com",
  projectId: "my-mini-dr",
  storageBucket: "my-mini-dr.appspot.com",
  messagingSenderId: "320612794855",
  appId: "1:320612794855:web:41a12febae93e9c2363d42",
  measurementId: "G-LFFPYPP3CB"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_Auth = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_STORE = getStorage(FIREBASE_APP);
const analytics = getAnalytics(FIREBASE_APP);