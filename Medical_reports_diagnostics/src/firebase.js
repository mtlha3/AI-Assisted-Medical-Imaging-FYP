import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID,
// };

const firebaseConfig = {
  apiKey: "AIzaSyDsTDjjoDgCtBVNcLAYOTrDEOcIxAhoPuw",
  authDomain: "finalyearproject-bb61e.firebaseapp.com",
  projectId: "finalyearproject-bb61e",
  storageBucket: "finalyearproject-bb61e.firebasestorage.app",
  messagingSenderId: "626702084740",
  appId: "1:626702084740:web:64c3890e62c512e1a630d1",
  measurementId: "G-QBZ0C8KQYP"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
