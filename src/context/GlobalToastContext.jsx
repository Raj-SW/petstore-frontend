import React, { createContext, useContext, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

const GlobalToastContext = createContext();

export const GlobalToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    show: false,
    message: "",
    bg: "warning",
  });

  const showToast = (message, bg = "warning") => {
    setToast({ show: true, message, bg });
  };

  const handleClose = () => setToast({ ...toast, show: false });

  return (
    <GlobalToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer position="top-center" className="mt-5">
        <Toast
          onClose={handleClose}
          show={toast.show}
          delay={3000}
          autohide
          bg={toast.bg}
        >
          <Toast.Header>
            <strong className="me-auto">Notice</strong>
          </Toast.Header>
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </GlobalToastContext.Provider>
  );
};

export const useGlobalToast = () => useContext(GlobalToastContext);
