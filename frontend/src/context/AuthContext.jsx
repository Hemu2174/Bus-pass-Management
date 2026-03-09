import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi, setAuthToken } from "@/api/apiService";

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = "smart-pass-auth";

const getStoredAuth = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.token && parsed?.isAuthenticated) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => getStoredAuth() || { role: null, user: null, isAuthenticated: false, token: null });

  useEffect(() => {
    if (auth?.isAuthenticated && auth?.token) {
      setAuthToken(auth.token);
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
      }
    } else {
      setAuthToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, [auth]);

  const loginStudent = async (email, password) => {
    try {
      const res = await authApi.loginStudent(email, password);
      setAuthToken(res.token);
      setAuth({ role: "student", user: res.user, isAuthenticated: true, token: res.token });
      return true;
    } catch {
      return false;
    }
  };

  const loginParent = async (email, password, fatherName) => {
    try {
      const res = await authApi.loginParent(email, password, fatherName);
      setAuthToken(res.token);
      setAuth({ role: "parent", user: res.user, isAuthenticated: true, token: res.token });
      return true;
    } catch {
      return false;
    }
  };

  const loginAdmin = async (name, password) => {
    try {
      const res = await authApi.loginAdmin(name, password);
      setAuthToken(res.token);
      setAuth({ role: "admin", user: res.user, isAuthenticated: true, token: res.token });
      return true;
    } catch {
      return false;
    }
  };

  const registerStudent = async (data) => {
    try {
      const res = await authApi.registerStudent(data);
      setAuthToken(res.token);
      setAuth({ role: "student", user: res.user, isAuthenticated: true, token: res.token });
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error?.message || "Registration failed" };
    }
  };

  const registerAdmin = async (data) => {
    try {
      const res = await authApi.registerAdmin(data);
      setAuthToken(res.token);
      setAuth({ role: "admin", user: res.user, isAuthenticated: true, token: res.token });
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error?.message || "Registration failed" };
    }
  };

  const logout = () => {
    setAuthToken(null);
    setAuth({ role: null, user: null, isAuthenticated: false, token: null });
  };

  return (
    <AuthContext.Provider value={{ ...auth, loginStudent, loginParent, loginAdmin, registerStudent, registerAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
