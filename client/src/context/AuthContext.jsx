import { createContext, useContext, useMemo, useState } from "react";
import api, { getErrorMessage } from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem("wishly_auth");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  const saveAuth = (value) => {
    setAuth(value);
    if (value) {
      localStorage.setItem("wishly_auth", JSON.stringify(value));
    } else {
      localStorage.removeItem("wishly_auth");
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveAuth(data);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: getErrorMessage(error, "Login failed") };
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", payload);
      saveAuth(data);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: getErrorMessage(error, "Register failed") };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    saveAuth(null);
  };

  const value = useMemo(
    () => ({
      auth,
      user: auth
        ? {
            _id: auth._id,
            name: auth.name,
            email: auth.email,
            isAdmin: auth.isAdmin
          }
        : null,
      token: auth?.token || null,
      isLoggedIn: Boolean(auth?.token),
      loading,
      login,
      register,
      logout
    }),
    [auth, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
