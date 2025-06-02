import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_NODE_API_URL;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for stored token and validate it
    const token = localStorage.getItem("token");
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/auth/validate`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.user);
    } catch (err) {
      localStorage.removeItem("token");
      setError("Session expired. Please login again.");
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

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setUser(user);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      return { success: false, error: err.response?.data?.message };
    }
  };

  const signup = async (userData) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/signup`, userData);

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setUser(user);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
      return { success: false, error: err.response?.data?.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUser = async (userData) => {
    try {
      const response = await axios.put(`${API_URL}/auth/user`, userData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUser(response.data.user);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
      return { success: false, error: err.response?.data?.message };
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
      return { success: false, error: err.response?.data?.message };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword,
      });
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
      return { success: false, error: err.response?.data?.message };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      setError(null);
      const response = await axios.put(
        `${API_URL}/auth/change-password`,
        {
          oldPassword,
          newPassword,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
      return { success: false, error: err.response?.data?.message };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    updateUser,
    requestPasswordReset,
    resetPassword,
    changePassword,
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
