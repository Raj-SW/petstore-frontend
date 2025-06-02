import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_NODE_API_URL;

// Configure axios to include credentials
axios.defaults.withCredentials = true;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on initial load
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        setUser(response.data.data);
        return { success: true };
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      return {
        success: false,
        error: err.response?.data?.message || "Login failed",
      };
    }
  };

  const signup = async (userData) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/signup`, userData);

      if (response.data.success) {
        return { success: true };
      }
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
      return {
        success: false,
        error: err.response?.data?.message || "Signup failed",
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email,
      });
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email");
      return {
        success: false,
        error: err.response?.data?.message || "Failed to send reset email",
      };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        password: newPassword,
      });
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
      return {
        success: false,
        error: err.response?.data?.message || "Failed to reset password",
      };
    }
  };

  const resendVerificationEmail = async (email) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/resend-verification`, {
        email,
      });
      return { success: true, data: response.data };
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to resend verification email"
      );
      return {
        success: false,
        error:
          err.response?.data?.message || "Failed to resend verification email",
      };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    requestPasswordReset,
    resetPassword,
    resendVerificationEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
