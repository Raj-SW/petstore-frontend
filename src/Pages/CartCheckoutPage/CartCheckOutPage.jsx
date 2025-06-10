import { useEffect } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { CartItem } from "../../Components/HelperComponents/CartItem/CartItem";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useToast } from "../../context/ToastContext";
import { useCart } from "react-use-cart";
import "./CartCheckOutPage.css";

const CartCheckoutPage = () => {
  const navigate = useNavigate();
  const { showCartToast, showCheckoutToast } = useToast();
  const {
    items,
    cartTotal,
    totalItems,
    updateItemQuantity,
    removeItem,
    emptyCart,
  } = useCart();

  const handleQuantityChange = (itemId, newQuantity) => {
    updateItemQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      showCartToast("remove", item.title);
      removeItem(itemId);
    }
  };

  const handleCheckout = () => {
    showCheckoutToast("success");
    emptyCart();
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <Container className="empty-cart-message">
        <h2>Your cart is empty</h2>
        <Button
          variant="primary"
          className="continue-shopping-btn rounded-5"
          onClick={() => navigate("/")}
        >
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <div className="cart-checkout-bg">
      <Container className="cart-checkout-main rounded-4 p-4">
        <Row>
          {/* Left: Cart Items */}
          <Col lg={8} className="cart-items-col">
            <div
              className="d-flex align-items-center mb-3 gap-2 continue-shopping-link"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              <FaArrowLeft size={20} />
              <span className="poppins-medium fs-6">Continue Shopping</span>
            </div>
            <div className="cart-items-section">
              <div className="d-flex align-items-end justify-content-between mb-2">
                <div>
                  <h4 className="mb-0">Shopping Cart</h4>
                  <span className="cart-subtitle text-muted">
                    You have {totalItems} item
                    {totalItems > 1 ? "s" : ""} in your cart
                  </span>
                </div>
              </div>
              <hr className="my-3" />
              <div className="cart-items-list">
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
                    onIncreaseQuantity={(id) =>
                      handleQuantityChange(id, item.quantity + 1)
                    }
                    onDecreaseQuantity={(id) =>
                      handleQuantityChange(id, item.quantity - 1)
                    }
                    onRemoveItem={handleRemoveItem}
                  />
                ))}
              </div>
            </div>
          </Col>

          {/* Right: Card Details */}
          <Col lg={4} className="card-details-col">
            <div className="card-details-wrapper p-4">
              <h5 className="card-details-title mb-4">Order Summary</h5>
              <div className="card-summary mt-4 primary-color-font ">
                <div className="d-flex justify-content-between mb-2">
                  <span>Sub Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping</span>
                  <span>${(cartTotal > 0 ? 20 : 0).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between fw-bold mb-3">
                  <span>Total</span>
                  <span>
                    ${(cartTotal + (cartTotal > 0 ? 20 : 0)).toFixed(2)}
                  </span>
                </div>
                <Button
                  variant="success"
                  className="checkout-btn d-flex align-items-center justify-content-center w-100"
                  style={{ gap: "0.5rem" }}
                  onClick={handleCheckout}
                >
                  Check Out <FaArrowRight />
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CartCheckoutPage;
