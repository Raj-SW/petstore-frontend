import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { FaShoppingCart } from "react-icons/fa";
import { useToast } from "@/context/ToastContext";
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
    <div className="pcv2-card" onClick={() => navigate(`/product/${id}`)}>
      <div className="pcv2-img-wrap">
        <img src={imageUrl} alt={title} className="pcv2-img" />
      </div>

      <div className="pcv2-info">
        <p className="pcv2-name">{title}</p>
        <p className="pcv2-desc">
          {description || "Premium quality product for your pet."}
        </p>
        <div className="pcv2-bottom-row">
          <span className="pcv2-price">${price}</span>
          <button
            className="pcv2-cart-btn"
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            <FaShoppingCart size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCardV2;
