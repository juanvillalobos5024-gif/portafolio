// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC9uRXSksSK9KDyiUBFBpE_fUPgp3cMq9g",
  authDomain: "portafolio-e4595.firebaseapp.com",
  projectId: "portafolio-e4595",
  storageBucket: "portafolio-e4595.firebasestorage.app",
  messagingSenderId: "1038934875102",
  appId: "1:1038934875102:web:ac3afc1266059444e41b4f",
  measurementId: "G-1HCNF5QS22"
};

// Initialize Firebase (prevent re-initializing in Next.js dev environment)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics only on the client side
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

import { getFirestore } from "firebase/firestore";
const db = getFirestore(app);

export { app, analytics, db };
