import { useState } from "react";
import { IconContext } from "react-icons";
import { RxAvatar } from "react-icons/rx";
import LoginModal from "./LoginModal";
import SignUpModal from "./SignUpModal";
import "./SignUpDropdown.css";

const SignUpDropdown = ({ showLogin, setShowLogin }) => {
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
        className="d-flex align-items-center nav-user-btn"
        onClick={handleOpenLogin}
      >
        <IconContext.Provider value={{ color: "inherit", size: "1.6rem" }}>
          <RxAvatar style={{ marginRight: 5, verticalAlign: "middle" }} />
        </IconContext.Provider>
        <span className="d-none d-lg-inline" style={{ fontSize: "0.9rem" }}>Login</span>
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
