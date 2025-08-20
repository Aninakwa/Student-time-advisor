// public/firebaseConfig.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyARvmrHc4h7VVX3qSikpFwQoCakIe6gTMc",
  authDomain: "timerapp-b7c71.firebaseapp.com",
  projectId: "timerapp-b7c71",
  storageBucket: "timerapp-b7c71.firebasestorage.app",
  messagingSenderId: "771458730610",
  appId: "1:771458730610:web:3c5f00a127e7bdcb0ed0eb",
  measurementId: "G-JSLBDE0T3L",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // optional—only if you use analytics
export const auth = getAuth(app); // for Authentication
export const db = getFirestore(app); // for Cloud Firestore
export const storage = getStorage(app);

