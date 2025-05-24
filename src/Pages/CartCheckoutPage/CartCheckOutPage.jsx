import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { CartItem } from "../../Components/HelperComponents/CartItem/CartItem";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useToast } from "../../context/ToastContext";
import "./CartCheckOutPage.css";

const CartCheckoutPage = () => {
  const navigate = useNavigate();
  const { showCartToast, showCheckoutToast } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    // Retrieve cart items from sessionStorage
    const storedItems = sessionStorage.getItem("cartItems");
    const storedTotal = sessionStorage.getItem("cartTotal");

    if (!storedItems || !storedTotal) {
      // If no items in cart, redirect to home
      navigate("/");
      return;
    }

    setCartItems(JSON.parse(storedItems));
    setCartTotal(parseFloat(storedTotal));
  }, [navigate]);

  const handleQuantityChange = (itemId, newQuantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (item) {
      showCartToast("remove", item.name);
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemId)
      );
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handleCheckout = () => {
    // Store updated cart items before proceeding
    sessionStorage.setItem("cartItems", JSON.stringify(cartItems));
    sessionStorage.setItem("cartTotal", calculateTotal().toString());
    showCheckoutToast("success");
    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <Container className="empty-cart-message">
        <h2>Your cart is empty</h2>
        <Button
          variant="primary"
          className="continue-shopping-btn"
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
                    You have {cartItems.length} item
                    {cartItems.length > 1 ? "s" : ""} in your cart
                  </span>
                </div>
              </div>
              <hr className="my-3" />
              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onIncreaseQuantity={(id) => {
                      const item = cartItems.find((i) => i.id === id);
                      if (item) {
                        handleQuantityChange(id, item.quantity + 1);
                      }
                    }}
                    onDecreaseQuantity={(id) => {
                      const item = cartItems.find((i) => i.id === id);
                      if (item && item.quantity > 1) {
                        handleQuantityChange(id, item.quantity - 1);
                      }
                    }}
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
                <div className="d-flex justify-content-between  mb-2">
                  <span>Sub Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-betweenmb-2">
                  <span>Shipping</span>
                  <span>${(calculateTotal() > 0 ? 20 : 0).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between fw-bold mb-3">
                  <span>Total</span>
                  <span>
                    $
                    {(
                      calculateTotal() + (calculateTotal() > 0 ? 20 : 0)
                    ).toFixed(2)}
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
