import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCjIWgo-M6A_0MLok-tLuEtvJM25CTvY20",
  authDomain: "lifeshield-ecom1.firebaseapp.com",
  projectId: "lifeshield-ecom1",
  storageBucket: "lifeshield-ecom1.firebasestorage.app",
  messagingSenderId: "308682892298",
  appId: "1:308682892298:web:7fd1f05afa756b7676abf3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
