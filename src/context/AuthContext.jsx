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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for logout events from API interceptor
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (response?.success && response?.data) {
        setUser(response.data);
      } else if (response?.data) {
        setUser(response.data);
      } else if (response && typeof response === "object" && response.id) {
        setUser(response);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
      // Don't set error for initial auth check
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authApi.login(email, password);

      if (response?.success && response?.data) {
        setUser(response.data);
        return { success: true, user: response.data };
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
        return { success: true, message: "Account created successfully" };
      }

      throw new Error("Invalid response from server");
    } catch (err) {
      const errorMessage = err?.message || "Signup failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Even if logout fails on server, clear local state
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await authApi.updateProfile(profileData);

      if (response?.success && response?.data) {
        setUser(response.data);
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
      const response = await authApi.changePassword(
        currentPassword,
        newPassword
      );

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
      const errorMessage =
        err?.message || "Failed to resend verification email";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteAccount = async () => {
    try {
      setError(null);
      const response = await authApi.deleteAccount();

      if (response?.success) {
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
    (permission) => {
      return hasPermission(user, permission);
    },
    [user]
  );

  const checkRole = useCallback(
    (role) => {
      return hasRole(user, role);
    },
    [user]
  );

  const checkAnyRole = useCallback(
    (roles) => {
      return hasAnyRole(user, roles);
    },
    [user]
  );

  const isUserProfessional = useCallback(() => {
    return isProfessional(user);
  }, [user]);

  const isUserAdmin = useCallback(() => {
    return isAdmin(user);
  }, [user]);

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
