import React, { useState } from "react";
import { IconContext } from "react-icons";
import { RxAvatar } from "react-icons/rx";
import LoginModal from "./LoginModal";
import SignUpModal from "./SignUpModal";
import "./SignUpDropdown.css";

const SignUpDropdown = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleOpenLogin = () => {
    setShowSignUp(false);
    setShowLogin(true);
  };
  const handleOpenSignUp = () => {
    setShowLogin(false);
    setShowSignUp(true);
  };
  const handleCloseLogin = () => setShowLogin(false);
  const handleCloseSignUp = () => setShowSignUp(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <>
      <button
        className="nav-login-btn"
        onClick={handleOpenLogin}
        style={{
          display: "flex",
          alignItems: "center",
          background: "transparent",
          border: "none",
          color: "white",
          fontWeight: 700,
          fontFamily: "Poppins, sans-serif",
          fontSize: "1.15rem",
          cursor: "pointer",
          gap: "0.5rem",
          padding: "0 12px",
        }}
      >
        <IconContext.Provider value={{ color: "white", size: "1.5rem" }}>
          <RxAvatar style={{ marginRight: 4 }} />
        </IconContext.Provider>
        <span>Login</span>
      </button>
      <LoginModal
        show={showLogin}
        onHide={handleCloseLogin}
        showPassword={showPassword}
        togglePasswordVisibility={togglePasswordVisibility}
        onSignUpClick={handleOpenSignUp}
      />
      <SignUpModal
        show={showSignUp}
        onHide={handleCloseSignUp}
        showPassword={showPassword}
        togglePasswordVisibility={togglePasswordVisibility}
        onLoginClick={handleOpenLogin}
      />
    </>
  );
};

export default SignUpDropdown;
