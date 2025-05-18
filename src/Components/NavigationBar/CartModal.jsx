import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useCart } from "react-use-cart";
import { CartItem } from "../HelperComponents/CartItem/CartItem";
import "./CartModal.css";

const CartModal = ({
  show,
  onHide,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveItem,
}) => {
  const navigate = useNavigate();
  const { items, cartTotal, totalItems } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) {
      return; // Don't navigate if cart is empty
    }

    // Store cart items in sessionStorage for checkout page
    sessionStorage.setItem("cartItems", JSON.stringify(items));
    sessionStorage.setItem("cartTotal", cartTotal.toString());

    onHide();
    navigate("/checkout");
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="cart-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title className="cart-modal-title">
          Shopping Cart ({totalItems} items)
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {items.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <Button variant="outline-primary" onClick={onHide}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={{
                    ...item,
                    name: item.title,
                    image: item.image,
                    quantity: item.quantity || 1,
                    price: item.price,
                  }}
                  onIncreaseQuantity={onIncreaseQuantity}
                  onDecreaseQuantity={onDecreaseQuantity}
                  onRemoveItem={onRemoveItem}
                />
              ))}
            </div>
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>${(cartTotal > 0 ? 20 : 0).toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>
                  ${(cartTotal + (cartTotal > 0 ? 20 : 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Continue Shopping
        </Button>
        {items.length > 0 && (
          <Button
            variant="primary"
            onClick={handleCheckout}
            disabled={items.length === 0}
          >
            Proceed to Checkout
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default CartModal;
