import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCZFmlmcoXUvelbO1QNliht_UQqfDxw4ik",
    authDomain: "bulk-calling-dashboard.firebaseapp.com",
    projectId: "bulk-calling-dashboard",
    storageBucket: "bulk-calling-dashboard.firebasestorage.app",
    messagingSenderId: "327740981015",
    appId: "1:327740981015:web:f67032570075a75232c152",
    measurementId: "G-LKGBJ2J589"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, getDocs };
