import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 👇 Replace with the config object from your Firebase project settings
// (Project settings → General → Your apps → SDK setup and configuration).
// This is safe to commit — it's a public client identifier, not a secret.
// Access is controlled by your Firestore security rules, not by hiding this.
const firebaseConfig = {
  apiKey: "AIzaSyBnVQX4GBxOCFrkOtRKrQXDfp8UjE9BUww",
  authDomain: "dmv-drive-log.firebaseapp.com",
  projectId: "dmv-drive-log",
  storageBucket: "dmv-drive-log.firebasestorage.app",
  messagingSenderId: "789833299880",
  appId: "1:789833299880:web:086840a755bbda111e4f9d",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
