"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/utils/firebase";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const syncProfile = async () => {
    try {
      // Trigger backend user sync
      const res: any = await api.post("/auth/sync");
      setProfile(res.profile);
      
      // If profile is fresh and has no persona, redirect to onboarding questionnaire
      if (!res.profile.persona) {
        router.push("/onboarding");
      }
    } catch (err) {
      console.error("Error syncing user profile with backend:", err);
    }
  };

  const refreshProfile = async () => {
    try {
      const p = await api.get("/auth/profile");
      setProfile(p);
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Sync with backend
        await syncProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      console.error("Sign-Out Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithGoogle, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
