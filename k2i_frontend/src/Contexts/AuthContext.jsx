import React, { createContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:7000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem("k2i_token") || null);
  const [loading, setLoading] = useState(true);

  // ── Restore session ───────────────────────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res  = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setUser(data.user); else logout();
      } catch { logout(); }
      finally { setLoading(false); }
    };
    restore();
  }, [token]); // Added token to dependency array for safety

  const saveToken = (t) => { setToken(t); localStorage.setItem("k2i_token", t); };

  const logout = useCallback(() => {
    setUser(null); setToken(null); localStorage.removeItem("k2i_token");
  }, []);

  // ── Signup Step 1: Send details → returns { requireOtp, otpToken, maskedEmail } ─
  const signup = async (name, email, password, phone = "") => {
    const res  = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Signup failed");
    
    // If backend returns a token immediately (e.g., OTP disabled), log them in
    if (data.token && data.user) { 
      saveToken(data.token); 
      setUser(data.user); 
    }
    return data; // Caller handles requireOtp
  };

  // ── Signup Step 2: verify OTP → issues full JWT ───────────────────────────
  const verifySignupOtp = async (otpToken, otp) => {
    const res  = await fetch(`${API_BASE}/auth/verify-signup-otp`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otpToken, otp }),
    });
    const data = await res.json();
    if (data.success) { 
      saveToken(data.token); 
      setUser(data.user); 
    } else {
      throw new Error(data.message || "OTP verification failed");
    }
    return data;
  };

  // ── Login step 1: password → returns { requireOtp, otpToken, maskedEmail } ─
  const login = async (email, password) => {
    const res  = await fetch(`${API_BASE}/auth/login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Login failed");
    return data; 
  };

  // ── Login step 2: verify OTP → issues full JWT ────────────────────────────
  const verifyLoginOtp = async (otpToken, otp) => {
    const res  = await fetch(`${API_BASE}/auth/verify-login-otp`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otpToken, otp }),
    });
    const data = await res.json();
    if (data.success) { saveToken(data.token); setUser(data.user); }
    else throw new Error(data.message || "OTP verification failed");
    return data;
  };

  // ── Forgot password step 1: send OTP ─────────────────────────────────────
  const forgotPassword = async (email) => {
    const res  = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to send OTP");
    return data;
  };

  // ── Forgot password step 2: verify OTP → returns resetToken ──────────────
  const verifyForgotOtp = async (otpToken, otp) => {
    const res  = await fetch(`${API_BASE}/auth/verify-forgot-otp`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otpToken, otp }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "OTP verification failed");
    return data; // { resetToken }
  };

  // ── Reset password ────────────────────────────────────────────────────────
  const resetPassword = async (resetToken, password) => {
    const res  = await fetch(`${API_BASE}/auth/reset-password/${resetToken}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.success) { saveToken(data.token); setUser(data.user); }
    else throw new Error(data.message || "Reset failed");
    return data;
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const resendOtp = async (otpToken, type) => {
    const res  = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otpToken, type }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Resend failed");
    return data;
  };

  // ── Update profile ────────────────────────────────────────────────────────
  const updateProfile = async (updates) => {
    const res  = await fetch(`${API_BASE}/user/profile`, {
      method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (data.success) setUser(data.user);
    else throw new Error(data.message || "Update failed");
    return data;
  };

  // ── Authenticated fetch ───────────────────────────────────────────────────
  const authFetch = useCallback(async (url, options = {}) => {
    const res  = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.status === 401) logout();
    return data;
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      signup, verifySignupOtp, login, verifyLoginOtp, // <-- EXPORTED HERE!
      forgotPassword, verifyForgotOtp, resetPassword, resendOtp,
      logout, updateProfile, authFetch,
      API_BASE,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;