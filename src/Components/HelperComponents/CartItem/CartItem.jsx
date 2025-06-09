import { Button, Col, Image } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { BsPlus, BsDash } from "react-icons/bs";
import "./CartItem.css";

export const CartItem = ({
  item,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveItem,
  showQuantityControls = true,
  showRemoveButton = true,
}) => {
  return (
    <Col xs={12}>
      <div className="cart-item d-flex align-items-center justify-content-between border rounded-3 p-3 mb-3 bg-light">
        <div className="d-flex align-items-center gap-3">
          <Image src={item.image} alt={item.name} className="cart-item-image" />
          <div>
            <div className="fw-semibold poppins-medium">{item.name}</div>
            <div
              className="text-muted poppins-regular"
              style={{ fontSize: "0.9rem" }}
            >
              ${item.price.toFixed(2)} each
            </div>
          </div>
        </div>
        {showQuantityControls && (
          <div className="quantity-controls d-flex align-items-center">
            <Button
              variant="outline-secondary"
              size="sm"
              className="quantity-btn"
              onClick={() => onDecreaseQuantity(item.id)}
              disabled={item.quantity <= 1}
            >
              <BsDash size={20} />
            </Button>
            <span className="quantity-number mx-3 poppins-medium">
              {item.quantity}
            </span>
            <Button
              variant="outline-secondary"
              size="sm"
              className="quantity-btn"
              onClick={() => onIncreaseQuantity(item.id)}
            >
              <BsPlus size={20} />
            </Button>
          </div>
        )}
        <div className="fw-bold poppins-semibold primary-color-font">
          ${(item.price * item.quantity).toFixed(2)}
        </div>
        {showRemoveButton && (
          <Button
            variant="link"
            className="remove-btn p-0"
            onClick={() => onRemoveItem(item.id)}
          >
            <FaTrash />
          </Button>
        )}
      </div>
    </Col>
  );
};
