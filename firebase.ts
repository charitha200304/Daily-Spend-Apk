// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB25-fLaAfftcCquMWqUk75mBBypyb5dYk",
  authDomain: "my-wallet-1dce2.firebaseapp.com",
  projectId: "my-wallet-1dce2",
  storageBucket: "my-wallet-1dce2.firebasestorage.app",
  messagingSenderId: "298078109925",
  appId: "1:298078109925:web:22ced4f715bd0952b1d40c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);