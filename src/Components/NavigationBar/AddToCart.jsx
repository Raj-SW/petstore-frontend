import React, { useState } from "react";
import "./AddToCart.css";
//Component import
import { FaCartShopping } from "react-icons/fa6";
import { IconContext } from "react-icons";
import { useNavigate } from "react-router-dom";
import CartModal from "./CartModal";

const AddToCart = ({
  itemCount,
  cartItems,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveItem,
}) => {
  const [showCartModal, setShowCartModal] = useState(false);

  const handleCartClick = () => {
    setShowCartModal(true);
  };

  return (
    <>
      <IconContext.Provider value={{ size: "2rem" }}>
        {/* Set icon size here */}
        <div className="cartWrapper" onClick={handleCartClick}>
          <FaCartShopping className="cartIcon" />
          {itemCount > 0 && <div className="cartBadge">{itemCount}</div>}
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
