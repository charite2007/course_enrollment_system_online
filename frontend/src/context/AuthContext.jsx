import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth as authApi, users as usersApi } from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: verify the JWT cookie is still valid and get fresh user data from DB
  useEffect(() => {
    usersApi
      .getProfile()
      .then((d) => {
        authApi.setUser(d.user);
        setUserState(d.user);
      })
      .catch(() => {
        // Cookie invalid or expired — clear stale localStorage
        authApi.setUser(null);
        setUserState(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async register(payload) {
        const data = await authApi.register(payload);
        authApi.setUser(data.user);
        setUserState(data.user);
        return data.user;
      },
      async login(payload) {
        const data = await authApi.login(payload);
        authApi.setUser(data.user);
        setUserState(data.user);
        return data.user;
      },
      async logout() {
        authApi.setUser(null);
        setUserState(null);
        try { await authApi.logout(); } catch { /* ignore */ }
      },
      setUser(nextUser) {
        authApi.setUser(nextUser);
        setUserState(nextUser);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
