import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";   // <-- IMPORTANT

const firebaseConfig = {
  apiKey: "AIzaSyDVMtJKClvFishqMfRausqIb6sSks0E8uQ",
  authDomain: "ryze-imharry.firebaseapp.com",
  projectId: "ryze-imharry",
  storageBucket: "ryze-imharry.appspot.com",
  messagingSenderId: "382407512756",
  appId: "1:382407512756:web:aff4a1f07a881dd8273de1",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 
