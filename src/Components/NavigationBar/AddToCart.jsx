import React, { useState, useEffect, useRef } from "react";
import "./AddToCart.css";
//Component import
import { FaCartShopping } from "react-icons/fa6";
import { IconContext } from "react-icons";
import { useToast } from "../../context/ToastContext";
import CartModal from "./CartModal";

const AddToCart = ({
  itemCount,
  cartItems,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveItem,
  currentItem,
}) => {
  const [showCartModal, setShowCartModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevItemCount = useRef(itemCount);
  const { showCartToast } = useToast();

  useEffect(() => {
    if (itemCount > prevItemCount.current && currentItem) {
      setIsAnimating(true);
      showCartToast("add", currentItem.title);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300); // Match this with the animation duration
      return () => clearTimeout(timer);
    }
    prevItemCount.current = itemCount;
  }, [itemCount, currentItem, showCartToast]);

  const handleCartClick = () => {
    setShowCartModal(true);
  };

  return (
    <>
      <IconContext.Provider value={{ size: "2rem" }}>
        {/* Set icon size here */}
        <div className="cartWrapper" onClick={handleCartClick}>
          <FaCartShopping className="cartIcon" />
          {itemCount > 0 && (
            <div className={`cartBadge ${isAnimating ? "animate" : ""}`}>
              {itemCount}
            </div>
          )}
        </div>
      </IconContext.Provider>

      <CartModal
        show={showCartModal}
        onHide={() => setShowCartModal(false)}
        cartItems={cartItems}
        onIncreaseQuantity={onIncreaseQuantity}
        onDecreaseQuantity={onDecreaseQuantity}
        onRemoveItem={onRemoveItem}
      />
    </>
  );
};

export default AddToCart;
