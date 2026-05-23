import { useState } from "react";
import { RxAvatar } from "react-icons/rx";
import LoginModal from "./LoginModal";
import SignUpModal from "./SignUpModal";

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
  const togglePasswordVisibility = () => setShowPassword((p) => !p);

  return (
    <>
      <button className="nav-user-btn" onClick={handleOpenLogin}>
        <RxAvatar size={22} />
        <span className="nav-user-name">Login</span>
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
