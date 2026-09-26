import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { BoardUser, DEMO_USER } from "@/data/boardMockData";

// Frontend-only auth: any well-formed email + non-empty password signs in as the demo director.
// Swap `login` for a real API call when the backend lands.

interface AuthContextValue {
  user: BoardUser | null;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "lexora-board-session";

function readSession(): BoardUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BoardUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<BoardUser | null>(() => readSession());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // keep tabs in sync
    const onStorage = () => setUser(readSession());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback(async (email: string, password: string, remember = true) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setIsLoading(false);
    if (!email.trim() || !password) throw new Error("Invalid email or password");
    if (password.length < 4) throw new Error("Invalid email or password");
    const session: BoardUser = { ...DEMO_USER, email: email.trim() };
    try {
      (remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      /* storage unavailable; keep in memory */
    }
    setUser(session);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
