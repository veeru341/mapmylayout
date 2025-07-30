import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAyzDoNVE3it0WaJJCcPhsW5C-W4LOFXfI",
  authDomain: "mapmylout.firebaseapp.com",
  projectId: "mapmylout",
  storageBucket: "mapmylout.firebasestorage.app",
  messagingSenderId: "809491884607",
  appId: "1:809491884607:web:c32585dd7bc6165cf2268a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
