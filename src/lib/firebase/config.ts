import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0H7LzWsyB7009jRNzdXNK5WFPRGw2ywM",
  authDomain: "money-management-1f742.firebaseapp.com",
  projectId: "money-management-1f742",
  storageBucket: "money-management-1f742.firebasestorage.app",
  messagingSenderId: "129493849965",
  appId: "1:129493849965:web:648d7a8c2beaa54f95ac64",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
