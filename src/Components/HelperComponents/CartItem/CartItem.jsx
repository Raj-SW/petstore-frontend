import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import "./CartItem.css";

export const CartItem = ({
  item,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveItem,
  showQuantityControls = true,
  showRemoveButton = true,
}) => (
  <div className="cart-item">
    <img src={item.image} alt={item.name} className="cart-item-image" />

    <div className="cart-item-info">
      <h4 className="cart-item-name">{item.name}</h4>
      <p className="cart-item-unit">${item.price.toFixed(2)} each</p>
    </div>

    {showQuantityControls && (
      <div className="cart-item-qty">
        <button
          type="button"
          onClick={() => onDecreaseQuantity(item.id)}
          disabled={item.quantity <= 1}
          aria-label="Decrease quantity"
        >
          <FaMinus size={11} />
        </button>
        <span>{item.quantity}</span>
        <button
          type="button"
          onClick={() => onIncreaseQuantity(item.id)}
          aria-label="Increase quantity"
        >
          <FaPlus size={11} />
        </button>
      </div>
    )}

    <div className="cart-item-total">
      ${(item.price * item.quantity).toFixed(2)}
    </div>

    {showRemoveButton && (
      <button
        type="button"
        className="cart-item-remove"
        onClick={() => onRemoveItem(item.id)}
        aria-label={`Remove ${item.name}`}
      >
        <FaTrash size={14} />
      </button>
    )}
  </div>
);
