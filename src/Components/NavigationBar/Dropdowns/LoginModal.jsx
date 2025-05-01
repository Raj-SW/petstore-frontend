import React from "react";
import {
  Modal,
  Button,
  Col,
  Container,
  Form,
  InputGroup,
} from "react-bootstrap";
import {
  FaUser,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaFacebook,
} from "react-icons/fa";
import { IconContext } from "react-icons";
import brandLogoV2 from "../../../assets/Decoratives/BrandV2.png";
import catLogin from "../../../assets/Decoratives/Cat with Log In.png";

const LoginModal = ({
  show,
  onHide,
  showPassword,
  togglePasswordVisibility,
  onSignUpClick,
}) => (
  <Modal show={show} onHide={onHide} className="authModal loginModal" size="lg">
    <Modal.Body className="authModal-body d-flex">
      <Container className="d-flex p-0 m-0 loginContainer">
        <Col className="p-3 w-100 pt-5">
          <h3 className="mb-4 text-center poppins-extrabold secondary-color-font">
            Log In to VitalPaws
          </h3>
          <Form className="poppins-regular p-4">
            <InputGroup className="mb-3">
              <InputGroup.Text className="bg-white">
                <FaUser className="text-success" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="SamanthaSmith"
                className="border-start-0"
                required
              />
            </InputGroup>
            <InputGroup className="mb-2">
              <InputGroup.Text className="bg-white">
                <FaKey className="text-success" />
              </InputGroup.Text>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="********"
                className="border-start-0"
                required
              />
              <InputGroup.Text
                className="bg-white"
                onClick={togglePasswordVisibility}
                style={{ cursor: "pointer" }}
              >
                {showPassword ? (
                  <FaEye className="text-muted" />
                ) : (
                  <FaEyeSlash className="text-muted" />
                )}
              </InputGroup.Text>
            </InputGroup>
            <div className="text-end mb-3">
              <a href="#" className="text-success">
                Forgot Password?
              </a>
            </div>
            <Form.Group className="mb-4 text-start d-flex align-items-center">
              <Form.Check type="checkbox" id="rememberMe" />
              <Form.Label htmlFor="rememberMe" className="ms-2">
                Keep me logged in
              </Form.Label>
            </Form.Group>
            <div className="text-center">
              <Button
                variant="success"
                type="submit"
                className="w-25 rounded-pill"
                style={{ backgroundColor: "#74B49B", border: "none" }}
              >
                Log In
              </Button>
            </div>
          </Form>
          <div className="d-flex align-items-center my-3 pt-4 poppins-regular">
            <div className="flex-grow-1 border-bottom"></div>
            <span className="mx-2 custom-text-color">Or Sign Up with</span>
            <div className="flex-grow-1 border-bottom"></div>
          </div>
          <IconContext.Provider value={{ color: "#74B49B", size: "1.5rem" }}>
            <div className="d-flex justify-content-center gap-3 my-3 pt-4 pb-4">
              <FaGoogle />
              <FaFacebook />
            </div>
          </IconContext.Provider>
          <div className="text-center pb-4 poppins-regular">
            <p className="mt-4">
              Don't have an account?{" "}
              <a href="#" style={{ color: "#76c7c0" }} onClick={onSignUpClick}>
                Sign up
              </a>
            </p>
          </div>
        </Col>
        <Col className="loginDecoWrapper d-none d-lg-flex flex-column align-items-center justify-content-center">
          <Col className="loginDecoWrapper">
            <div className="p-4 d-flex justify-content-center">
              <img src={brandLogoV2} alt="Brand Logo" />
            </div>
            <div className="d-flex justify-content-center">
              <img src={catLogin} alt="Login Cat" />
            </div>
          </Col>
        </Col>
      </Container>
    </Modal.Body>
  </Modal>
);

export default LoginModal;
