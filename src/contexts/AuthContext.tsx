"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  auth,
  googleProvider,
  actionCodeSettings,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "@/lib/firebase";
import type { SessionUser } from "@/types";

interface AuthContextValue {
  firebaseUser: User | null;
  sessionUser: SessionUser | null;
  loading: boolean;
  sessionVerified: boolean;
  signInWithGoogle: () => Promise<SessionUser | null>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  finishMagicLinkSignIn: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const cacheKey = (uid: string) => `__session_cache_${uid}`;

function getCachedSession(uid: string): SessionUser | null {
  try {
    const raw = localStorage.getItem(cacheKey(uid));
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch { return null; }
}

function setCachedSession(uid: string, s: SessionUser) {
  try { localStorage.setItem(cacheKey(uid), JSON.stringify(s)); } catch {}
}

function clearCachedSession(uid: string) {
  try { localStorage.removeItem(cacheKey(uid)); } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser]     = useState<User | null>(null);
  const [sessionUser, setSessionUser]       = useState<SessionUser | null>(null);
  const [loading, setLoading]               = useState(true);
  const [sessionVerified, setSessionVerified] = useState(false);

  const syncSession = useCallback(async (user: User): Promise<SessionUser | null> => {
    const idToken = await user.getIdToken();
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) {
      return null;
    }
    const data: SessionUser = await res.json();
    setSessionUser(data);
    setSessionVerified(true);
    setCachedSession(user.uid, data);
    return data;
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setFirebaseUser(user);

      if (!user) {
        setSessionUser(null);
        setSessionVerified(false);
        setLoading(false);
        fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
        return;
      }

      // Use cache immediately so UI renders fast
      const cached = getCachedSession(user.uid);
      if (cached) {
        setSessionUser(cached);
        setLoading(false);
        // Background refresh to pick up role changes
        syncSession(user).catch(() => {});
      } else {
        // First sign-in — must wait for role from server
        try {
          await syncSession(user);
        } catch {
          // syncSession failed — user will see loading state
        } finally {
          setLoading(false);
        }
      }
    });
    return unsubscribe;
  }, [syncSession]);

  const signInWithGoogle = async (): Promise<SessionUser | null> => {
    const result = await signInWithPopup(auth, googleProvider);
    // Sync session immediately so callers can redirect without waiting for onAuthStateChanged
    return syncSession(result.user);
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged handles the rest
  };

  const sendMagicLink = async (email: string) => {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    localStorage.setItem("emailForSignIn", email);
  };

  const finishMagicLinkSignIn = async (email: string) => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      await signInWithEmailLink(auth, email, window.location.href);
      localStorage.removeItem("emailForSignIn");
    }
  };

  const logout = async () => {
    const uid = firebaseUser?.uid;
    await signOut(auth);
    if (uid) clearCachedSession(uid);
    setSessionUser(null);
    await fetch("/api/auth/session", { method: "DELETE" });
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        sessionUser,
        loading,
        sessionVerified,
        signInWithGoogle,
        signInWithEmail,
        sendMagicLink,
        finishMagicLinkSignIn,
        logout,
        isAdmin: sessionUser?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
