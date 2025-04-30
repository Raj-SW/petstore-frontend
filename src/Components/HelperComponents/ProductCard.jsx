import React from "react";
import { Card } from "react-bootstrap";
import { FaStar, FaShoppingBasket } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import heartImg from "../../assets/Decoratives/ProductHeart.svg";
import "./ProductCard.css";

const ProductCard = ({ id, imageUrl, title, price, rating, onAddToCart }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${id}`); // Navigate to the individual product page
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
        <img
          src={heartImg}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            cursor: "pointer",
            width: "1.25rem",
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
          <button onClick={onAddToCart}>
            <FaShoppingBasket size={20} />
          </button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
