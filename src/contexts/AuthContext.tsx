import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  login as loginRequest,
  fetchMyProfile,
  type BoardPortalUser,
} from "@/lib/board-api";

// Real auth — signs in against POST /api/auth/login (the same
// generic Lexora auth endpoint the tenant app and client portal use;
// jwt.strategy.ts/auth.service.ts have no BOARD_MEMBER-specific
// blocking). A board member only ever has usable credentials once
// their appointment letter has been countersigned — see
// board-member.service.ts#onAppointmentContractCountersigned on the
// backend — so a login attempt before that point genuinely fails
// with "Invalid credentials", same as any other account with an
// unset password would.

export interface BoardUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AuthContextValue {
  user: BoardUser | null;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_KEY = "boardToken";
const USER_KEY = "boardUser";

function readSession(): BoardUser | null {
  try {
    const raw =
      localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as BoardUser) : null;
  } catch {
    return null;
  }
}

function mapUser(u: BoardPortalUser, role: string): BoardUser {
  return {
    id: u._id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role,
  };
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

  const login = useCallback(
    async (email: string, password: string, remember = true) => {
      setIsLoading(true);
      try {
        const { user: rawUser, tokens } = await loginRequest(email, password);
        const store = remember ? localStorage : sessionStorage;
        // Store the token first — fetchMyProfile below goes through
        // the same axios instance, which reads it from storage.
        try {
          store.setItem(TOKEN_KEY, tokens.accessToken);
        } catch {
          /* storage unavailable; keep in memory */
        }
        // A director's role (Chair, Independent NED, etc.) lives on
        // the BoardMember record, not the User the login response
        // returns — one extra real call to get it for the sidebar.
        const profile = await fetchMyProfile().catch(() => null);
        const session = mapUser(rawUser, profile?.role ?? "Board Member");
        try {
          store.setItem(USER_KEY, JSON.stringify(session));
        } catch {
          /* storage unavailable; keep in memory */
        }
        setUser(session);
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? "Invalid email or password";
        throw new Error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
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
