import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import { FaStar, FaShoppingBasket } from "react-icons/fa";
import { useCart } from "react-use-cart";
import { useNavigate } from "react-router-dom";
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
      }, 300); // Match with CSS animation duration
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
      <div
        className="position-relative image-container"
        style={{ overflow: "hidden", borderRadius: "1.5rem" }}
      >
        <Card.Img
          src={imageUrl}
          alt={title}
          className="zoom-image d-flex justify-center"
          style={{
            width: "100%",
            borderRadius: "1.5rem",
            transition: "transform 0.3s ease-in-out",
            objectFit: "fill",
          }}
        />
      </div>
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
          <FaShoppingBasket
            size={30}
            onClick={handleAddToCart}
            className="basket-btn"
          />
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
