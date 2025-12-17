// File: src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyARHRt1CGcFxrWhkdlUVAhplkeyXF9n5YA",
  authDomain: "jichat-e55cd.firebaseapp.com",
  databaseURL:
    "https://jichat-e55cd-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "jichat-e55cd",
  storageBucket: "jichat-e55cd.firebasestorage.app",
  messagingSenderId: "382411371081",
  appId: "1:382411371081:web:f8ee423859d3760cc30598",
  measurementId: "G-R4YKGE248E",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
