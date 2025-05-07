import React from "react";
import { Button, Col } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
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
      <div className="d-flex align-items-center justify-content-between border rounded-3 p-3 mb-3 bg-light">
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              width: 60,
              height: 60,
              background: "#eee",
              borderRadius: 8,
            }}
          />
          <div>
            <div className="fw-semibold">{item.name}</div>
            <div className="text-muted" style={{ fontSize: "0.9rem" }}>
              {item.desc}
            </div>
          </div>
        </div>
        {showQuantityControls && (
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => onDecreaseQuantity(item.id)}
            >
              -
            </Button>
            <span className="mx-2">{item.qty}</span>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => onIncreaseQuantity(item.id)}
            >
              +
            </Button>
          </div>
        )}
        <div className="fw-bold">${item.price}</div>
        {showRemoveButton && (
          <Button
            variant="link"
            className="text-danger p-0"
            onClick={() => onRemoveItem(item.id)}
          >
            <FaTrash />
          </Button>
        )}
      </div>
    </Col>
  );
};
