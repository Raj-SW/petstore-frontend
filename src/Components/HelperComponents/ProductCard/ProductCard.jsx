import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { FaShoppingBasket } from "react-icons/fa";
import { useGlobalToast } from "@/context/GlobalToastContext";
import "./ProductCard.css";

const ProductCard = ({ id, imageUrl, title, price }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showToast } = useGlobalToast();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem({ id, name: title, price, image: imageUrl });
    showToast(`${title} added to cart!`, "success");
  };

  return (
    <button type="button" className="pc-card" onClick={() => navigate(`/petshop/${id}`)}>
      <img src={imageUrl} alt={title} className="pc-img" loading="lazy" />

      <div className="pc-tint" />

      <button className="pc-badge" onClick={handleAddToCart} aria-label="Add to cart">
        <FaShoppingBasket size={13} />
      </button>

      <div className="pc-panel">
        <div className="pc-info-row">
          <span className="pc-name">{title}</span>
          <span className="pc-price">${price}</span>
        </div>
        <div className="pc-btns">
          <button
            className="pc-buy"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/petshop/${id}`);
            }}
          >
            Buy
          </button>
          <button className="pc-add" onClick={handleAddToCart}>
            Add Item
          </button>
        </div>
      </div>
    </button>
  );
};

export default ProductCard;
