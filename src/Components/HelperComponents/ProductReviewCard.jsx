import React from "react";
// Component Import
import "./ProductReviewCard.css";
// Asset Import
import roundedProfilePic from "../../assets/Decoratives/roundedProfilePic.png";
import { FaStar } from "react-icons/fa";

const ProductReviewCard = ({
  name = "Angela Shamblin",
  rating = 5,
  reviewDescription = "I adopted my 3-month-old chihuahua mix from them (and they were transported to CT). I was very skeptical at first because I couldn't find too much detail about them when I googled the group and I wasn't sure about the validity of Adopt-a-Pet.",
}) => {
  return (
    <div className="productCardReviewWrapper text-center p-2">
      <div className="productCardReviewContainer text-center d-flex flex-column align-items-center gap-2 p-3 rounded-5">
        <img src={roundedProfilePic} alt="" className="profilePicImg" />
        <div className="starsContainer">
          <div className="mb-2 p-0">
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                style={{
                  color: index < rating ? "#FFA500" : "#E0E0E0",
                  marginRight: "2px",
                  width: "0.8rem",
                }}
              />
            ))}
          </div>
        </div>
        <p className="poppins-bold pale-green-color-font">{name}</p>
        <p className="poppins-regular reviewDescription">{reviewDescription}</p>
      </div>
    </div>
  );
};

export default ProductReviewCard;
