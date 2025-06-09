import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useGlobalToast } from "../../context/GlobalToastContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { showToast } = useGlobalToast();

  useEffect(() => {
    if (!loading && !user) {
      showToast("You need to log in to access your profile.", "warning");
    }
  }, [loading, user, showToast]);

  if (loading) return null;

  return user ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
