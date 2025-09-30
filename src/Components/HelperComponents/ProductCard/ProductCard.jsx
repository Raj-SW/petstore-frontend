import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Card } from "react-bootstrap";
import { FaStar, FaShoppingBasket } from "react-icons/fa";
import { useCart } from "react-use-cart";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "../../../context/ToastContext";
import "./ProductCard.css";

const ProductCard = ({ id, title, price, rating, imageUrl }) => {
  const { addItem, inCart } = useCart();
  const navigate = useNavigate();
  const { showCartToast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  // Memoize the rating stars array
  const ratingStars = useMemo(() => Array(5).fill(null), []);

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    if (inCart(id)) {
      showCartToast("add", title); 
      return;
    }

    setIsAdding(true);

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

      await addItem(itemToAdd);
      showCartToast("add", title);
    } catch (error) {
      showCartToast("error", "Failed to add item to cart. ");
    } finally {
      setTimeout(() => {
        setIsAdding(false);
      }, 500);
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleCardClick();
    }
  };

  return (
    <Card
      className="product-card"
      onClick={handleCardClick}
      onKeyPress={handleKeyPress}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${title}`}
    >
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
          loading="lazy"
        />
      </motion.div>
      <Card.Body className="text-center p-0">
        <Card.Title className="p-0 poppins-medium">{title}</Card.Title>
        <div className="d-flex justify-content-around p-0">
          <div className="poppins-regular">
            <p className="price-text">${price}</p>
            <div
              className="mb-2 p-0 rating-stars"
              role="img"
              aria-label={`${rating} out of 5 stars`}
            >
              {ratingStars.map((_, index) => (
                <FaStar
                  key={index}
                  className={index < rating ? "star-filled" : "star-empty"}
                  aria-hidden="true"
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
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleAddToCart(e);
              }
            }}
            aria-label={`Add ${title} to cart`}
          >
            <FaShoppingBasket
              size={30}
              className={`basket-btn ${isAdding ? "adding" : ""}`}
              aria-hidden="true"
            />
          </motion.div>
        </div>
      </Card.Body>
    </Card>
  );
};

ProductCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  rating: PropTypes.number.isRequired,
  imageUrl: PropTypes.string.isRequired,
};

export default ProductCard;
