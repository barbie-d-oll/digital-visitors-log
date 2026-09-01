"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

const SESSION_REFRESH_INTERVAL_MS = 15 * 60 * 1000;

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  organizationId: string;
  organizationName: string;
  organizationSlug?: string;
  organizationLogoUrl?: string;
  plan?: string;
  isDepartmentHead?: boolean;
};

type AuthContextType = {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ ok: false }),
  logout: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });

      if (!res.ok) {
        if (res.status === 401) {
          setUser(null);
        }
        return false;
      }

      const data = await res.json();
      setUser(data.user);
      return true;
    } catch {
      return false;
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else if (res.status === 401) {
        const refreshed = await refreshSession();
        if (!refreshed) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [refreshSession]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchUser();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchUser]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const handleFocus = () => {
      void refreshSession();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshSession();
      }
    };

    const intervalId = window.setInterval(() => {
      void refreshSession();
    }, SESSION_REFRESH_INTERVAL_MS);

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshSession, user]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { ok: false, error: data.error || "Login failed." };
      }

      setUser(data.user);
      return { ok: true };
    } catch {
      return { ok: false, error: "Network error. Please try again." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      router.push("/auth/login");
    }
  };

  const refresh = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
