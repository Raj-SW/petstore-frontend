import React from "react";
import "./CustomButton.css";

const CustomButton = ({ title, onClick }) => {
  return (
    <button className="customButton" onClick={onClick}>
      {title}
    </button>
  );
};

export default CustomButton;
