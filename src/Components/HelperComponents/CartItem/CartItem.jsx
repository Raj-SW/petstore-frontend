import { motion } from "framer-motion";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import Price from "../Price/Price";
import "./CartItem.css";

const btnSpring = { type: "spring", stiffness: 500, damping: 18 };

export const CartItem = ({
  item,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveItem,
  showQuantityControls = true,
  showRemoveButton = true,
}) => (
  <motion.div
    className="cart-item"
    layout
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ x: -90, opacity: 0, transition: { duration: 0.22, ease: "easeIn" } }}
    transition={{ type: "spring", stiffness: 320, damping: 26 }}
    whileHover={{ y: -2, transition: { type: "spring", stiffness: 400, damping: 18 } }}
  >
    <img
      src={item.image}
      alt={item.name}
      className="cart-item-image"
      loading="lazy"
      onError={(e) => { e.target.src = "https://placehold.co/72x72"; }}
    />

    <h4 className="cart-item-name">{item.name}</h4>

    {showRemoveButton && (
      <motion.button
        type="button"
        className="cart-item-remove"
        onClick={() => onRemoveItem(item.id)}
        aria-label={`Remove ${item.name}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.85 }}
        transition={btnSpring}
      >
        <FaTrash size={12} />
      </motion.button>
    )}

    <div className="cart-item-bottom">
      <p className="cart-item-unit"><Price amount={item.price} /> each</p>

      {showQuantityControls && (
        <div className="cart-item-qty">
          <motion.button
            type="button"
            onClick={() => onDecreaseQuantity(item.id)}
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
            whileTap={{ scale: 0.8 }}
            transition={btnSpring}
          >
            <FaMinus size={9} />
          </motion.button>
          <span>{item.quantity}</span>
          <motion.button
            type="button"
            onClick={() => onIncreaseQuantity(item.id)}
            aria-label="Increase quantity"
            whileTap={{ scale: 0.8 }}
            transition={btnSpring}
          >
            <FaPlus size={9} />
          </motion.button>
        </div>
      )}

      <div className="cart-item-total">
        <Price amount={item.price * item.quantity} />
      </div>
    </div>
  </motion.div>
);
