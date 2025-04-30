import React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Container from "react-bootstrap/Container";
import { FaLocationDot } from "react-icons/fa6";
import { IconContext } from "react-icons";
import { FaClock, FaFacebook, FaInstagram } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";

const SnackBar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <motion.div
        initial={{ height: "auto", opacity: 1 }}
        animate={{ height: scrolled ? 0 : "auto", opacity: scrolled ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }} // Smooth, snappy, and quick transition
        className="timezone-and-socials d-none d-md-block" // Hide on mobile
        style={{ overflow: "hidden", padding: "10px 0" }}
      >
        <Container>
          <div className="d-flex justify-content-center align-items-center">
            <div className="d-flex align-items-center mx-4">
              <IconContext.Provider
                value={{
                  color: "var(--secondary-color)",
                  className: "global-class-name",
                  size: "1.5em",
                }}
              >
                <FaClock />
              </IconContext.Provider>
              <p
                className="mb-0 ms-1"
                style={{ color: "var( --text-color)", whiteSpace: "nowrap" }}
              >
                Mon - Sat 9:00 / 18:00 GMT +4
              </p>
            </div>
            <div className="d-flex align-items-center mx-4">
              <IconContext.Provider
                value={{
                  color: "var(--secondary-color)",
                  className: "global-class-name",
                  size: "1.5em",
                }}
              >
                <FaLocationDot />
              </IconContext.Provider>
              <p
                className="mb-0 ms-1 "
                style={{ color: "var( --text-color)", whiteSpace: "nowrap" }}
              >
                Pet Store, Pamplemousses, Trou Aux Biches
              </p>
            </div>
            <div className="d-flex align-items-center mx-4">
              <IconContext.Provider
                value={{
                  color: "var(--secondary-color)",
                  className: "global-class-name",
                  size: "1.5em",
                }}
              >
                <FaFacebook className="mx-2" />
                <IoLogoWhatsapp className="mx-2" />
                <FaInstagram className="mx-2" />
              </IconContext.Provider>
            </div>
          </div>
        </Container>
      </motion.div>
    </>
  );
};

export default SnackBar;
