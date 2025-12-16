// File: src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB7Z2w5EV49tfKPRPj6wTPWvwb1fRp06Ms",
  authDomain: "helpaiya.firebaseapp.com",
  projectId: "helpaiya",
  storageBucket: "helpaiya.firebasestorage.app",
  messagingSenderId: "208942924416",
  appId: "1:208942924416:web:27da9a6bc901995eed1c65",
  measurementId: "G-Y36VLT0X9H",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
