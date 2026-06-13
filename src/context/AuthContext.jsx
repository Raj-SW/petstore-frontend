// frontend/src/context/AuthContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import authApi from "../Services/api/authApi";
import {
  hasPermission,
  hasRole,
  hasAnyRole,
  isProfessional,
  isAdmin,
} from "../constants/userConstants";

const AuthContext = createContext(null);

// Decode JWT payload and check if it's expired — no server call needed
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // malformed token → treat as expired
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth:logout event fired by apiClient on 401 responses
  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem("vp_token");
      localStorage.removeItem("vp_user");
      setUser(null);
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  // Check auth status on mount — synchronous, no API call needed
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem("vp_token");
    const cached = localStorage.getItem("vp_user");

    if (!token || isTokenExpired(token)) {
      // Token missing or expired — clear everything
      localStorage.removeItem("vp_token");
      localStorage.removeItem("vp_user");
      setUser(null);
    } else if (cached) {
      // Valid token + cached user — restore immediately
      try {
        setUser(JSON.parse(cached));
      } catch {
        localStorage.removeItem("vp_user");
        setUser(null);
      }
    } else {
      setUser(null);
    }

    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authApi.login(email, password);

      if (response?.success && response?.data) {
        const { user: userData, accessToken } = response.data;
        if (!accessToken) throw new Error("No access token in server response");
        setUser(userData);
        localStorage.setItem("vp_token", accessToken);
        localStorage.setItem("vp_user", JSON.stringify(userData));
        return { success: true, user: userData };
      }

      throw new Error("Invalid response from server");
    } catch (err) {
      const errorMessage = err?.message || "Login failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (userData) => {
    try {
      setError(null);
      const response = await authApi.signup(userData);

      if (response?.success) {
        return { success: true, message: "Account created successfully. Please sign in." };
      }

      throw new Error("Invalid response from server");
    } catch (err) {
      const errorMessage = err?.message || "Signup failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // JWT logout is client-side only — clear storage and state
  const logout = () => {
    localStorage.removeItem("vp_token");
    localStorage.removeItem("vp_user");
    setUser(null);
    setError(null);
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await authApi.updateProfile(profileData);

      if (response?.success && response?.data) {
        setUser(response.data);
        localStorage.setItem("vp_user", JSON.stringify(response.data));
        return { success: true, user: response.data };
      }

      throw new Error("Invalid response from server");
    } catch (err) {
      const errorMessage = err?.message || "Failed to update profile";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      const response = await authApi.changePassword(currentPassword, newPassword);

      if (response?.success) {
        return { success: true, message: "Password changed successfully" };
      }

      throw new Error("Invalid response from server");
    } catch (err) {
      const errorMessage = err?.message || "Failed to change password";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      setError(null);
      const response = await authApi.forgotPassword(email);
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err?.message || "Failed to send reset email";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setError(null);
      const response = await authApi.resetPassword(token, newPassword);
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err?.message || "Failed to reset password";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resendVerificationEmail = async (email) => {
    try {
      setError(null);
      const response = await authApi.resendVerification(email);
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err?.message || "Failed to resend verification email";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Merge partial fields into the current user + persist to localStorage.
  // Used after profile-photo upload so the navbar avatar updates live.
  const updateUser = (partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem("vp_user", JSON.stringify(next));
      return next;
    });
  };

  const deleteAccount = async () => {
    try {
      setError(null);
      const response = await authApi.deleteAccount();

      if (response?.success) {
        localStorage.removeItem("vp_token");
        localStorage.removeItem("vp_user");
        setUser(null);
        return { success: true, message: "Account deleted successfully" };
      }

      throw new Error("Invalid response from server");
    } catch (err) {
      const errorMessage = err?.message || "Failed to delete account";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Role and permission checks
  const checkPermission = useCallback(
    (permission) => hasPermission(user, permission),
    [user]
  );

  const checkRole = useCallback(
    (role) => hasRole(user, role),
    [user]
  );

  const checkAnyRole = useCallback(
    (roles) => hasAnyRole(user, roles),
    [user]
  );

  const isUserProfessional = useCallback(() => isProfessional(user), [user]);
  const isUserAdmin = useCallback(() => isAdmin(user), [user]);

  const value = {
    // State
    user,
    loading,
    error,
    isAuthenticated: !!user,

    // Auth methods
    login,
    signup,
    logout,
    checkAuthStatus,

    // Profile methods
    updateProfile,
    updateUser,
    changePassword,
    deleteAccount,

    // Password reset
    requestPasswordReset,
    resetPassword,
    resendVerificationEmail,

    // Role and permission checks
    hasPermission: checkPermission,
    hasRole: checkRole,
    hasAnyRole: checkAnyRole,
    isProfessional: isUserProfessional,
    isAdmin: isUserAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
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
