import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../HelperComponents/LoadingSpinner/LoadingSpinner";

/**
 * RoleBasedRoute - A wrapper component for role-based access control
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authorized
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route
 * @param {string} props.requirePermission - Specific permission required (optional)
 * @param {string} props.redirectTo - Path to redirect if unauthorized (default: '/login')
 * @param {React.ReactNode} props.fallback - Component to show while loading (optional)
 */
const RoleBasedRoute = ({
  children,
  allowedRoles = [],
  requirePermission = null,
  redirectTo = "/home",
  fallback = null,
}) => {
  const { user, loading, isAuthenticated, hasRole, hasAnyRole, hasPermission } =
    useAuth();

  // Show loading state
  if (loading) {
    return fallback || <LoadingSpinner />;
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check permission-based access
  if (requirePermission && !hasPermission(requirePermission)) {
    return <Navigate to={redirectTo} replace />;
  }

  // All checks passed, render the children
  return children;
};

export default RoleBasedRoute;
