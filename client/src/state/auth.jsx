import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { setAuthToken } from "../lib/api.js";

const AuthContext = createContext(null);

function normalizeError(err) {
  const msg =
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong";
  return String(msg);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("om_token") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("om_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        if (!cancelled) setUser(data.user);
      } catch (_e) {
        if (!cancelled) {
          setToken("");
          setUser(null);
          localStorage.removeItem("om_token");
          localStorage.removeItem("om_user");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("om_token", data.token);
    localStorage.setItem("om_user", JSON.stringify(data.user));
    return data.user;
  }

  async function register(name, email, password) {
    const { data } = await api.post("/auth/register", { name, email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("om_token", data.token);
    localStorage.setItem("om_user", JSON.stringify(data.user));
    return data.user;
  }

  function logout() {
    setToken("");
    setUser(null);
    localStorage.removeItem("om_token");
    localStorage.removeItem("om_user");
  }

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      register,
      logout,
      normalizeError,
      isAuthed: Boolean(token && user),
      isManager: user?.role === "manager" || user?.role === "admin",
      isAdmin: user?.role === "admin",
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

