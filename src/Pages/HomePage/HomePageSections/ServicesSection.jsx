import React from "react";
import "./ServicesSection.css";
import { Container } from "react-bootstrap";
import { motion, useInView, AnimatePresence } from "framer-motion";
import imgGrooming from "../../../assets/ServicesCardAssets/serviceImg1.png";
import imgVeterinary from "../../../assets/ServicesCardAssets/serviceImg2.png";
import imgBoarding from "../../../assets/ServicesCardAssets/serviceImg3.png";
import imgTraining from "../../../assets/ServicesCardAssets/serviceImg4.png";
import imgAdoption from "../../../assets/ServicesCardAssets/serviceImg5.png";
import starImg from "../../../assets/Decoratives/star1.png";

const primaryColors = [
  "var(--primary-green-color)",
  "var(--primary-blue-color)",
  "var(--primary-creme-color)",
  "var(--secondary-green-color)",
  "var(--secondary-blue-color)",
  "var(--tertiary-green-color)",
  "var(--tertiary-blue-color)",
];

const getRandomColor = () => {
  return primaryColors[Math.floor(Math.random() * primaryColors.length)];
};

const ServiceCard = ({
  image,
  title,
  description,
  initial,
  animate,
  transition,
  delay,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isMobilePopupOpen, setIsMobilePopupOpen] = React.useState(false);
  const [backgroundColor] = React.useState(getRandomColor());
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCardClick = () => {
    if (isMobile) {
      setIsMobilePopupOpen(true);
    }
  };

  const handleClosePopup = (e) => {
    e.stopPropagation();
    setIsMobilePopupOpen(false);
  };

  return (
    <>
      <motion.div
        className="image-overlay-container"
        initial={initial}
        animate={animate}
        transition={transition}
        whileHover={!isMobile ? { scale: 1.05 } : {}}
        onHoverStart={() => !isMobile && setIsHovered(true)}
        onHoverEnd={() => !isMobile && setIsHovered(false)}
        onClick={handleCardClick}
        whileTap={isMobile ? { scale: 0.95 } : {}}
      >
        <img
          src={image}
          alt=""
          style={{ objectFit: "cover", height: "100%", width: "100%" }}
        />
        <AnimatePresence>
          {isHovered && !isMobile && (
            <motion.div
              className="overlay"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "100%", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ backgroundColor }}
            >
              <motion.h3
                className="caveat-Heading fs-1 text-white"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {title}
              </motion.h3>
              <motion.p
                className="text-wrap text-white poppins-medium"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {description}
              </motion.p>
              <motion.button
                className="poppins-medium text-white"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                View More
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mobile Popup */}
      <AnimatePresence>
        {isMobilePopupOpen && (
          <motion.div
            className="mobile-popup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClosePopup}
          >
            <motion.div
              className="mobile-popup-content"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor }}
            >
              <motion.button
                className="close-button"
                onClick={handleClosePopup}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
              <motion.h3
                className="caveat-Heading text-white"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {title}
              </motion.h3>
              <motion.p
                className="text-white poppins-medium"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {description}
              </motion.p>
              <motion.button
                className="view-more-button poppins-medium text-white"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                View More
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const ServicesSection = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  const services = [
    {
      image: imgGrooming,
      title: "Grooming",
      description:
        "Professional pet grooming services to keep your furry friends looking their best. Our experienced groomers provide top-quality care.",
      className: "groomingCard",
      initial: { opacity: 0, x: -100 },
      animate: isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 },
      transition: { duration: 0.5, delay: 0.1 },
    },
    {
      image: imgBoarding,
      title: "Boarding",
      description:
        "Safe and comfortable boarding facilities for your pets when you're away. We ensure your pets feel at home with us.",
      className: "boardingCard",
      initial: { opacity: 0, y: 100 },
      animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 },
      transition: { duration: 0.5, delay: 0.2 },
    },
    {
      image: imgVeterinary,
      title: "Veterinary Care",
      description:
        "Comprehensive veterinary services to ensure your pet's health and well-being. Our experienced vets are here to help.",
      className: "veterinaryCard",
      initial: { opacity: 0, x: 100 },
      animate: isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 },
      transition: { duration: 0.5, delay: 0.3 },
    },
    {
      image: imgTraining,
      title: "Training",
      description:
        "Professional pet training programs to help your pets develop good behavior and essential skills.",
      className: "trainingCard",
      initial: { opacity: 0, y: -100 },
      animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -100 },
      transition: { duration: 0.5, delay: 0.4 },
    },
    {
      image: imgAdoption,
      title: "Adoption",
      description:
        "Find your perfect companion through our adoption program. Give a loving home to pets in need.",
      className: "adoptionCard",
      initial: { opacity: 0, scale: 0.5 },
      animate: isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 },
      transition: { duration: 0.5, delay: 0.5 },
    },
  ];

  return (
    <>
      <motion.div
        className="services-header"
        initial={{ opacity: 0, y: -50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="caveat-Heading">Our Curated Services</h1>
        <motion.img
          src={starImg}
          alt=""
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      <Container className="ServicesContainer" ref={ref}>
        {services.map((service, index) => (
          <div key={index} className={service.className}>
            <ServiceCard {...service} />
          </div>
        ))}
      </Container>
    </>
  );
};

export default ServicesSection;
