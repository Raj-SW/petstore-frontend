import React from "react";
import "./AnchorButton.css";
const AnchorButton = ({ text, icon, href }) => {
  return (
    <a href={href} className="anchor-button">
      {text} {icon}
    </a>
  );
};

export default AnchorButton;
