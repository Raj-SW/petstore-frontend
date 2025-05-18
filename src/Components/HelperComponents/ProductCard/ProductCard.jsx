import React, { useState } from "react";
import { Card } from "react-bootstrap";
import { FaStar, FaShoppingBasket } from "react-icons/fa";
import { useCart } from "react-use-cart";
import { useNavigate } from "react-router-dom";
import "./ProductCard.css";

const ProductCard = ({ id, title, price, rating, imageUrl }) => {
  const { addItem, inCart } = useCart();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent card click when clicking add to cart

    if (inCart(id)) {
      return; // Item already in cart
    }

    setIsAdding(true);
    try {
      // Ensure all item information is properly structured
      const itemToAdd = {
        id: id.toString(), // Ensure ID is string for consistency
        title: title.trim(), // Clean up title
        price: parseFloat(price), // Ensure price is a number
        image: imageUrl, // Store image URL
        quantity: 1, // Default quantity
        rating: rating, // Store rating for reference
        itemTotal: parseFloat(price), // Calculate initial total
        timestamp: new Date().toISOString(), // Add timestamp for sorting
      };

      addItem(itemToAdd);

      // Visual feedback
      const button = e.currentTarget;
      button.style.backgroundColor = "#4CAF50";
      button.style.color = "white";

      setTimeout(() => {
        button.style.backgroundColor = "";
        button.style.color = "";
        setIsAdding(false);
      }, 1000);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      setIsAdding(false);
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
      onClick={handleCardClick} // Add click event to navigate
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
        {/* <img
          src={heartImg}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            cursor: "pointer",
            width: "1.25rem",
          }}
        /> */}
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
          <button
            onClick={handleAddToCart}
            className="add-to-cart-btn"
            disabled={isAdding || inCart(id)}
            style={{
              transition: "all 0.3s ease",
              opacity: inCart(id) ? 0.5 : 1,
            }}
          >
            <FaShoppingBasket size={20} />
          </button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
