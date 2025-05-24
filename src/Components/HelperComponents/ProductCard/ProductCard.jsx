import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import { FaStar, FaShoppingBasket } from "react-icons/fa";
import { useCart } from "react-use-cart";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./ProductCard.css";

const ProductCard = ({ id, title, price, rating, imageUrl }) => {
  const { addItem, inCart } = useCart();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [clicked, setClicked] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();

    if (inCart(id)) {
      return;
    }

    setIsAdding(true);
    setClicked(true);
    try {
      const itemToAdd = {
        id: id.toString(),
        title: title.trim(),
        price: parseFloat(price),
        image: imageUrl,
        quantity: 1,
        rating: rating,
        itemTotal: parseFloat(price),
        timestamp: new Date().toISOString(),
      };

      addItem(itemToAdd);

      setTimeout(() => {
        setIsAdding(false);
        setClicked(false);
      }, 500); // Increased from 300 to 500 for slower animation
    } catch (error) {
      console.error("Error adding item to cart:", error);
      setIsAdding(false);
      setClicked(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  return (
    <Card
      className="card"
      style={{
        borderRadius: "15px",
        boxShadow: "5px 5px 5px 5px rgba(0, 0, 0, 0.1)",
        padding: "0.5rem",
        border: "none",
      }}
      onClick={handleCardClick}
    >
      <motion.div
        className="position-relative image-container"
        style={{ overflow: "hidden", borderRadius: "1.5rem" }}
        whileHover={{ scale: 1.1 }}
        transition={{
          duration: 0.5, // Increased from 0.3 to 0.5
          ease: [0.6, -0.05, 0.01, 0.99], // Custom easing for smoother motion
        }}
      >
        <Card.Img
          src={imageUrl}
          alt={title}
          className="zoom-image d-flex justify-center"
          style={{
            width: "100%",
            borderRadius: "1.5rem",
            transition: "transform 0.5s ease-in-out", // Increased from 0.3 to 0.5
            objectFit: "fill",
          }}
        />
      </motion.div>
      <Card.Body className="text-center p-0">
        <Card.Title className="p-0 poppins-medium">{title}</Card.Title>
        <div className="d-flex justify-content-around p-0">
          <div className="poppins-regular">
            <p className="price-text">${price}</p>
            <div className="mb-2 p-0">
              {[...Array(5)].map((_, index) => (
                <FaStar
                  key={index}
                  style={{
                    color: index < rating ? "#FFA500" : "#E0E0E0",
                    marginRight: "2px",
                    width: "0.8rem",
                  }}
                />
              ))}
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            transition={{
              duration: 0.3,
              ease: [0.6, -0.05, 0.01, 0.99],
            }}
            onClick={handleAddToCart}
          >
            <FaShoppingBasket
              size={30}
              className={`basket-btn ${isAdding ? "adding" : ""}`}
            />
          </motion.div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
