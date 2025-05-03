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
        className="nav-link d-flex align-items-center"
        onClick={handleOpenLogin}
        style={{
          background: "transparent",
          border: "none",
          color: "white",
          fontWeight: 500,
          fontFamily: "Poppins, sans-serif",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        <IconContext.Provider value={{ color: "inherit", size: "2.5rem" }}>
          <RxAvatar style={{ marginRight: 6, verticalAlign: "middle" }} />
        </IconContext.Provider>
        <span className="d-none d-lg-inline fs-5">Login</span>
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
