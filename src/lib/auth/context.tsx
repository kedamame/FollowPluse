"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface AuthUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string | null;
  signerUuid: string;
}

interface AuthContextType {
  user: AuthUser | null;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signIn: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("followpulse_user");
    return stored ? JSON.parse(stored) : null;
  });

  const signIn = useCallback((u: AuthUser) => {
    setUser(u);
    localStorage.setItem("followpulse_user", JSON.stringify(u));
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem("followpulse_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
