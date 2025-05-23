import React from "react";
import { Container, Row, Col, Image } from "react-bootstrap";
import { motion } from "framer-motion";
import "./CommunitySection.css";
import mobileThumbnailImg from "../../../assets/CommunityAssets/mobileThumbnail4.png";
import pawImg from "../../../assets/Decoratives/fontisto_paw.png";
import googlePlayImg from "../../../assets/Decoratives/googleplay1.png";
import appStoreImg from "../../../assets/Decoratives/app-store.png";

const CommunitySection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
      },
    },
  };

  const imageVariants = {
    hidden: { x: 100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: "easeOut",
      },
    },
  };

  const perkVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: (i) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.3,
        duration: 0.8,
      },
    }),
  };

  return (
    <Container className="communitySectionWrapper d-flex flex-column flex-md-row justify-content-center flex-wrap mb-5 p-0">
      <Col md={6} className="CommunityTextWrapper p-5">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={itemVariants}>
            <p className="caveat-Heading fs-1 secondary-color-font">
              Join the Community{" "}
              <motion.img
                src={pawImg}
                alt="paw"
                animate={{
                  rotate: [0, 10, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            </p>
          </motion.div>
          <motion.div className="p-2 poppins-regular" variants={itemVariants}>
            <p>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quasi ab
              eligendi vero assumenda dolorum nemo atque aliquid facilis tenetur
              rerum! Deserunt, eveniet! Beatae assumenda, deleniti culpa dicta
            </p>
          </motion.div>
          <motion.div
            className="poppins-medium p-4 fs-5"
            variants={itemVariants}
          >
            <p>Perks :</p>
            <ul className="list-unstyled">
              {["Perk 1", "Perk 2", "Perk 3", "Perk 4"].map((perk, index) => (
                <motion.li
                  key={index}
                  custom={index}
                  variants={perkVariants}
                  whileHover={{ x: 10 }}
                >
                  {perk}
                </motion.li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            className="CommunitySectionStoreLinksWrapper"
            variants={itemVariants}
          >
            <motion.img
              src={googlePlayImg}
              alt="Google Play"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            />
            <motion.img
              src={appStoreImg}
              alt="App Store"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            />
          </motion.div>
        </motion.div>
      </Col>
      <Col md={6} className="CommunityImageWrapper">
        <motion.img
          src={mobileThumbnailImg}
          alt="Mobile Thumbnail"
          variants={imageVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5 }}
        />
      </Col>
    </Container>
  );
};

export default CommunitySection;
