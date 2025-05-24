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
      }, 500);
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
    <Card className="product-card" onClick={handleCardClick}>
      <motion.div
        className="position-relative image-container"
        whileHover={{ scale: 1.1 }}
        transition={{
          duration: 0.5,
          ease: [0.6, -0.05, 0.01, 0.99],
        }}
      >
        <Card.Img
          src={imageUrl}
          alt={title}
          className="zoom-image d-flex justify-center"
        />
      </motion.div>
      <Card.Body className="text-center p-0">
        <Card.Title className="p-0 poppins-medium">{title}</Card.Title>
        <div className="d-flex justify-content-around p-0">
          <div className="poppins-regular">
            <p className="price-text">${price}</p>
            <div className="mb-2 p-0 rating-stars">
              {[...Array(5)].map((_, index) => (
                <FaStar
                  key={index}
                  className={index < rating ? "star-filled" : "star-empty"}
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
