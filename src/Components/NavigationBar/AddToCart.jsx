import React from "react";
import "./AddToCart.css";
//Component import
import { FaCartShopping } from "react-icons/fa6";
import { IconContext } from "react-icons";
import { useNavigate } from "react-router-dom";

import Modal from "react-bootstrap/Modal";
//Asset import
const AddToCart = ({ itemCount }) => {
  const navigate = useNavigate();

  const handleCartClick = () => {
    navigate("/Checkout");
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
    </>
  );
};

export default AddToCart;
