/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id?: string;
  _id?: string;
  email?: string;
  name?: string;
  image?: string;
  role?: string;
  brand?: string;
  type?: string;
  provider?: "google" | "email";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (provider: "google" | "email", data?: any) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  setUserFromData: (userData: any, token?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: read saved user from localStorage or from URL params (redirect)
  useEffect(() => {
    // 1) If redirected from backend with ?user=...&token=..., capture that
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get("user");
    const tokenParam = params.get("token");

    if (userParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(userParam));
        setUserFromData(decoded, tokenParam ?? undefined);

        // remove query params to clean URL
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } catch (err) {
        console.error("Failed to parse user param", err);
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2) Otherwise load from localStorage (if present)
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (err) {
        console.warn("Failed to parse saved user from localStorage", err);
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  // Provide a simple normalizer and persister — call this after signup / oauth redirect
  const setUserFromData = (userData: any, token?: string) => {
    if (!userData) return;
    const normalized: User = {
      id: userData._id || userData.id || undefined,
      _id: userData._id,
      email: userData.email || undefined,
      name: userData.name || userData.displayName || undefined,
      image: userData.photo || userData.image || undefined,
      role: userData.role || userData.role?.toLowerCase?.() || undefined,
      brand: userData.brand || undefined,
      type: userData.type || undefined,
      status: userData.status || "active",
      provider: userData.provider || undefined,
    };

    setUser(normalized);

    try {
      localStorage.setItem("user", JSON.stringify(normalized));
      if (token) localStorage.setItem("token", token);
    } catch (err) {
      console.warn("Failed to persist auth data to localStorage", err);
    }
  };

  const signIn = async (provider: "google" | "email", data?: any) => {
    if (provider === "google") {
      // start backend OAuth — backend should redirect back with ?user=...&token=...
      window.location.href = "http://localhost:5000/auth/google";
      return;
    }

    // email (magic link) - keep minimal stub if you want to enable later
    if (provider === "email" && data?.email) {
      await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
    }
  };

  const signOut = () => {
    // clear client-side state only (no network calls)
    setUser(null);
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch (err) {
      console.warn("Failed to remove auth data from localStorage", err);
    }
    // optionally redirect to home/login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        isAuthenticated: !!user,
        setUserFromData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
