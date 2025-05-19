import React from "react";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useCart } from "react-use-cart";
import { useToast } from "../../context/ToastContext";
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
  const { showCartToast, showCheckoutToast } = useToast();

  const handleCheckout = () => {
    if (items.length === 0) {
      return;
    }

    sessionStorage.setItem("cartItems", JSON.stringify(items));
    sessionStorage.setItem("cartTotal", cartTotal.toString());
    showCheckoutToast("success");
    onHide();
    navigate("/checkout");
  };

  const handleRemoveItem = (itemId) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      showCartToast("remove", item.title);
      onRemoveItem(itemId);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="cart-modal shadow-lg"
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="cart-modal-title poppins-semibold">
          <i className="bi bi-cart3 me-2 text-secondary"></i>
          Shopping Cart ({totalItems} items)
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4">
        {items.length === 0 ? (
          <div className="empty-cart d-flex flex-column align-items-center justify-content-center p-5">
            <div className="empty-cart-icon mb-4">
              <i className="bi bi-cart-x display-1 text-secondary opacity-50"></i>
            </div>
            <h4 className="poppins-medium text-secondary mb-3">
              Your cart is empty
            </h4>
            <p className="text-muted text-center mb-4 poppins-regular">
              Looks like you haven't added anything to your cart yet.
              <br />
              Browse our products and start shopping!
            </p>
          </div>
        ) : (
          <>
            <div className="cart-items py-3">
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
                  onRemoveItem={handleRemoveItem}
                />
              ))}
            </div>
            <div className="cart-summary shadow-sm">
              <div className="summary-row poppins-regular">
                <span>Subtotal:</span>
                <span className="text-secondary">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row poppins-regular">
                <span>Shipping:</span>
                <span className="text-secondary">
                  ${(cartTotal > 0 ? 20 : 0).toFixed(2)}
                </span>
              </div>
              <div className="summary-row total poppins-semibold">
                <span>Total:</span>
                <span className="text-primary">
                  ${(cartTotal + (cartTotal > 0 ? 20 : 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0 pt-2 pb-4">
        <Button
          className="rounded-pill px-4 py-2 button-primary shadow-sm"
          onClick={onHide}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Continue Shopping
        </Button>
        {items.length > 0 && (
          <Button
            className="rounded-pill px-4 py-2 button-primary shadow-sm ms-2"
            onClick={handleCheckout}
          >
            <i className="bi bi-credit-card me-2"></i>
            Proceed to Checkout
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default CartModal;
