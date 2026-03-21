import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithEmailAndPassword,
  updatePassword,
  confirmPasswordReset,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  type User,
  type Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Only initialize Firebase when:
 *  1. Running in the browser (not during SSR/SSG)
 *  2. A real API key is present (not during local dev without .env.local)
 *
 * All auth methods are called from useEffect or user-triggered callbacks,
 * so stub values on server/unconfigured environments are safe.
 */
const isConfigured =
  typeof window !== "undefined" &&
  !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const app = isConfigured
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null;


const auth: Auth = isConfigured ? getAuth(app!) : ({} as Auth);
const googleProvider: GoogleAuthProvider = isConfigured
  ? new GoogleAuthProvider()
  : ({} as GoogleAuthProvider);

// Magic link redirect URL — must be an Authorized Domain in Firebase Console
const actionCodeSettings = {
  url: `${process.env.NEXT_PUBLIC_APP_URL}/login?finishSignIn=true`,
  handleCodeInApp: true,
};

export {
  app,
  auth,
  googleProvider,
  actionCodeSettings,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithEmailAndPassword,
  updatePassword,
  confirmPasswordReset,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  type User,
};
