import React, { useState } from "react";
import { Button, Row, Col, Form, Container } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { CaretDownIcon } from "@radix-ui/react-icons";
import "./CartCheckOutPage.css";
import { CartItem } from "../../Components/HelperComponents/CartItem/CartItem";
import CustomButton from "@/Components/HelperComponents/CustomButton/CustomButton";
import { ImCircleRight } from "react-icons/im";

const initialCartItems = [
  {
    id: 1,
    name: "Item Name",
    desc: "Small item Description",
    price: 1800,
    qty: 2,
  },
  {
    id: 2,
    name: "Item Name",
    desc: "Small item Description",
    price: 1800,
    qty: 2,
  },
  {
    id: 3,
    name: "Item Name",
    desc: "Small item Description",
    price: 1800,
    qty: 2,
  },
  {
    id: 4,
    name: "Item Name",
    desc: "Small item Description",
    price: 1800,
    qty: 2,
  },
];

const CartCheckOutPage = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const increaseQuantity = (id) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id && item.qty > 1 ? { ...item, qty: item.qty - 1 } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );
  const shipping = 20;
  const total = subtotal + shipping;

  return (
    <div className="cart-checkout-wrapper">
      <Container className="py-5">
        <Row className="cart-body rounded-4 p-4">
          <Row className="justify-content-center">
            <Col lg={8}>
              <div className="bg-white ">
                <Row className="mb-3 align-items-center">
                  <Col>
                    <Button variant="link" className="p-0">
                      <CaretDownIcon
                        className="CaretDownBreadCrumb"
                        aria-hidden
                        style={{
                          width: "2.5rem",
                          height: "2.5rem",
                          color: "#667479",
                          transform: "rotate(90deg)",
                        }}
                      />
                    </Button>
                    <p className="poppins-medium fs-6">Continue Shopping</p>
                  </Col>
                </Row>
                <h4 className="mb-3">
                  Shopping Cart{" "}
                  <span className="text-muted" style={{ fontSize: "1rem" }}>
                    You have {cartItems.length} items in your cart
                  </span>
                </h4>
                <hr className="my-3" />

                <Row>
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onIncreaseQuantity={increaseQuantity}
                      onDecreaseQuantity={decreaseQuantity}
                      onRemoveItem={removeItem}
                    />
                  ))}
                </Row>
              </div>
            </Col>
            <Col lg={4}>
              <div
                className="card-details-wrapper rounded-4 p-4 mb-4"
                style={{ minWidth: 300 }}
              >
                <h5 className="mb-3" style={{ color: "white" }}>
                  Card Details
                </h5>
                <Form>
                  <Row className="mb-2">
                    <Col>
                      <Form.Label className="mb-1" style={{ color: "white" }}>
                        Card Type
                      </Form.Label>
                      <div className="d-flex gap-2">
                        {[1, 2, 3, 4].map((_, index) => (
                          <div
                            key={index}
                            style={{
                              width: 32,
                              height: 24,
                              background: "#eee",
                              borderRadius: 4,
                            }}
                          />
                        ))}
                      </div>
                    </Col>
                  </Row>
                  <Form.Group className="card-details-form mb-2">
                    <Form.Control placeholder="Cardholder's Name" />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Control placeholder="Card Number" />
                  </Form.Group>
                  <Row className="mb-2">
                    <Col>
                      <Form.Control placeholder="Expiration" />
                    </Col>
                    <Col>
                      <Form.Control placeholder="CVC" />
                    </Col>
                  </Row>
                  <Row className="mt-4 d-flex flex-column gap-2">
                    <div className="d-flex justify-content-between">
                      <span style={{ color: "white" }}>Sub Total</span>
                      <span style={{ color: "white" }}>
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span style={{ color: "white" }}>Shipping</span>
                      <span style={{ color: "white" }}>
                        ${shipping.toFixed(2)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between fw-bold">
                      <span style={{ color: "white" }}>Total</span>
                      <span style={{ color: "white" }}>
                        ${total.toFixed(2)}
                      </span>
                    </div>
                    <CustomButton
                      className="checkout-button"
                      title={"Check Out"}
                      icon={<ImCircleRight />}
                    ></CustomButton>
                  </Row>
                </Form>
              </div>
            </Col>
          </Row>
        </Row>
      </Container>
    </div>
  );
};

export default CartCheckOutPage;
