"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { UserProfile } from "@/models/types";

interface AuthContextValue {
  user: UserProfile | null;
  isAuth: boolean;
  setUser: (user: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Deliberately NOT persisted (no cookie/localStorage) — this matches the
 * original Flutter app's AuthProvider exactly, which only ever held the
 * logged-in user in memory and lost it on refresh. There is no Firebase
 * Authentication and no password anywhere in the original app; "login" is
 * just a name+phone lookup against Firestore. See MIGRATION_PLAN.md §5.6
 * for why this was reproduced as-is rather than replaced with a real auth
 * system.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);

  const setUser = useCallback((u: UserProfile) => setUserState(u), []);
  const logout = useCallback(() => setUserState(null), []);

  return (
    <AuthContext.Provider value={{ user, isAuth: user !== null, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
