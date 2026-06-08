import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { FaShoppingCart } from "react-icons/fa";
import { useToast } from "@/context/ToastContext";
import Price from "../Price/Price";
import "./ProductCardV2.css";

const ProductCardV2 = ({ id, imageUrl, title, price, description }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showCartToast } = useToast();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem({ id, name: title, price, image: imageUrl });
    showCartToast("add", title);
  };

  return (
    <motion.div
      className="pcv2-card"
      onClick={() => navigate(`/product/${id}`)}
      whileHover={{ y: -6, transition: { duration: 0.22, ease: "easeOut" } }}
    >
      <div className="pcv2-img-wrap">
        <img src={imageUrl} alt={title} className="pcv2-img" />
      </div>

      <div className="pcv2-info">
        <p className="pcv2-name">{title}</p>
        <p className="pcv2-desc">
          {description || "Premium quality product for your pet."}
        </p>
        <div className="pcv2-bottom-row">
          <Price amount={price} className="pcv2-price" />
          <button
            className="pcv2-cart-btn"
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            <FaShoppingCart size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCardV2;
