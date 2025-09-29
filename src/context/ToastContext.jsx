import React, { createContext, useContext, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaShoppingCart,
  FaCreditCard,
  FaKey,
  FaBell,
  FaUserEdit,
  FaHeart,
} from "react-icons/fa";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success", icon = null) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type, icon }]);
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const getToastIcon = (type, customIcon) => {
    if (customIcon) return customIcon;

    switch (type) {
      case "success":
        return <FaCheckCircle className="text-success" />;
      case "error":
        return <FaExclamationCircle className="text-danger" />;
      case "warning":
        return <FaExclamationCircle className="text-warning" />;
      case "info":
        return <FaInfoCircle className="text-info" />;
      default:
        return <FaInfoCircle className="text-info" />;
    }
  };

  // Predefined toast messages for common actions
  const showCartToast = (action, productName) => {
    const message =
      action === "add"
        ? `${productName} added to cart successfully!`
        : `${productName} removed from cart`;
    addToast(message, "success", <FaShoppingCart className="text-success" />);
  };

  const showCheckoutToast = (status) => {
    if (status === "success") {
      addToast(
        "Order placed successfully! Thank you for your purchase.",
        "success",
        <FaCreditCard className="text-success" />
      );
    } else {
      addToast(
        "There was an error processing your order. Please try again.",
        "error",
        <FaCreditCard className="text-danger" />
      );
    }
  };

  const showAuthToast = (action, status) => {
    const messages = {
      login: {
        success: "Successfully logged in! Welcome back.",
        error: "Login failed. Please check your credentials.",
      },
      signup: {
        success:
          "Account created successfully! Welcome to VitalPaws. Now try to login",
        error: "Signup failed. Please try again.",
      },
      logout: {
        success: "Successfully logged out. See you soon!",
        error: "Error logging out. Please try again.",
      },
      passwordReset: {
        request: "Password reset link sent to your email.",
        success:
          "Password reset successful. Please login with your new password.",
        error: "Password reset failed. Please try again.",
      },
    };

    const message = messages[action][status];
    addToast(
      message,
      status,
      <FaKey
        className={`text-${status === "success" ? "success" : "danger"}`}
      />
    );
  };

  const showProfileToast = (action, status) => {
    const messages = {
      update: {
        success: "Profile updated successfully!",
        error: "Failed to update profile. Please try again.",
      },
      avatar: {
        success: "Profile picture updated successfully!",
        error: "Failed to update profile picture. Please try again.",
      },
    };

    const message = messages[action][status];
    addToast(
      message,
      status,
      <FaUserEdit
        className={`text-${status === "success" ? "success" : "danger"}`}
      />
    );
  };

  const showWishlistToast = (action, productName) => {
    const message =
      action === "add"
        ? `${productName} added to wishlist!`
        : `${productName} removed from wishlist`;
    addToast(message, "success", <FaHeart className="text-danger" />);
  };

  const showNotificationToast = (message, type = "info") => {
    addToast(message, type, <FaBell className={`text-${type}`} />);
  };

  return (
    <ToastContext.Provider
      value={{
        addToast,
        showCartToast,
        showCheckoutToast,
        showAuthToast,
        showProfileToast,
        showWishlistToast,
        showNotificationToast,
      }}
    >
      {children}
      <ToastContainer
        className="p-3"
        position="top-end"
        style={{ zIndex: 9999, position: "fixed", top: 0, right: 0 }}
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            onClose={() => removeToast(toast.id)}
            show={true}
            delay={2000}
            autohide
            className="toast-custom"
          >
            <Toast.Header className={`toast-header-${toast.type}`}>
              <div className="d-flex align-items-center">
                {getToastIcon(toast.type, toast.icon)}
                <strong className="ms-2 me-auto">Notification</strong>
              </div>
            </Toast.Header>
            <Toast.Body
              style={{ position: "relative", paddingBottom: "1.5rem" }}
            >
              <strong>{toast.message}</strong>
              
              {/* Progress Bar */}
              <ToastProgressBar key={toast.id} duration={4000} />
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

// Progress bar component for toast auto-close
const ToastProgressBar = ({ duration }) => {
  const [width, setWidth] = React.useState(100);
  React.useEffect(() => {
    let start;
    let frame;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const percent = Math.max(0, 100 - (elapsed / duration) * 100);
      setWidth(percent);
      if (percent > 0) {
        frame = requestAnimationFrame(animate);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [duration]);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        height: "4px",
        width: "100%",
        background: "rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          background: "var(--primary-color, #0d6efd)",
          transition: "width 0.1s linear",
        }}
      />
    </div>
  );
};
