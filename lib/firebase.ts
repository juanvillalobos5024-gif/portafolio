import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC9uRXSksSK9KDyiUBFBpE_fUPgp3cMq9g",
  authDomain: "portafolio-e4595.firebaseapp.com",
  projectId: "portafolio-e4595",
  storageBucket: "portafolio-e4595.firebasestorage.app",
  messagingSenderId: "1038934875102",
  appId: "1:1038934875102:web:ac3afc1266059444e41b4f",
  measurementId: "G-1HCNF5QS22"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
