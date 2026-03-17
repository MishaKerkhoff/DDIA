import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';

// TODO: Replace with your Firebase project config
// 1. Go to https://console.firebase.google.com
// 2. Create a project (e.g., "ddia-notes")
// 3. Enable Firestore Database (start in test mode)
// 4. Enable Authentication → Google sign-in provider
// 5. Register a web app and paste the config below
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

let app, db, auth;

const isConfigured = firebaseConfig.apiKey !== "";

if (isConfigured) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
}

export { db, auth, isConfigured };

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  if (!isConfigured || !auth) return null;
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    return null;
  }
}

export async function signOutUser() {
  if (!isConfigured || !auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
  }
}

export function onAuthChange(callback) {
  if (!isConfigured || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
