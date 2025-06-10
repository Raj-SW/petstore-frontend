import { useState, useEffect, useRef } from "react";
import "./AddToCart.css";
//Component import
import { FaCartShopping } from "react-icons/fa6";
import { IconContext } from "react-icons";
import { useToast } from "../../context/ToastContext";
import { useCart } from "react-use-cart";
import CartModal from "./CartModal";

const AddToCart = ({ currentItem }) => {
  const [showCartModal, setShowCartModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { totalItems } = useCart();
  const prevItemCount = useRef(totalItems);
  const { showCartToast } = useToast();

  useEffect(() => {
    if (totalItems > prevItemCount.current && currentItem) {
      setIsAnimating(true);
      showCartToast("add", currentItem.title);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300); // Match this with the animation duration
      return () => clearTimeout(timer);
    }
    prevItemCount.current = totalItems;
  }, [totalItems, currentItem, showCartToast]);

  const handleCartClick = () => {
    setShowCartModal(true);
  };

  return (
    <>
      <IconContext.Provider value={{ size: "2rem" }}>
        {/* Set icon size here */}
        <div className="cartWrapper" onClick={handleCartClick}>
          <FaCartShopping className="cartIcon" />
          {totalItems > 0 && (
            <div className={`cartBadge ${isAnimating ? "animate" : ""}`}>
              {totalItems}
            </div>
          )}
        </div>
      </IconContext.Provider>

      <CartModal show={showCartModal} onHide={() => setShowCartModal(false)} />
    </>
  );
};

export default AddToCart;
