import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB27UttYJP-jGEbYAJc-EtD01iKneClSRE",
  authDomain: "demantia-spring-test-no-use.firebaseapp.com",
  projectId: "demantia-spring-test-no-use",
  storageBucket: "demantia-spring-test-no-use.firebasestorage.app",
  messagingSenderId: "707295687237",
  appId: "1:707295687237:web:64afbe2c70b5f72aa6292c",
  measurementId: "G-473TL5X46Z",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
