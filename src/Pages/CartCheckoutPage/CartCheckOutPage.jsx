import React, { useState } from "react";
import { Button, Row, Col, Form, Container } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { CaretDownIcon } from "@radix-ui/react-icons";
import "./CartCheckOutPage.css";

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
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <div className="bg-white rounded-4 p-4 mb-4">
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
            <Row>
              {cartItems.map((item) => (
                <Col xs={12} key={item.id}>
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
                        <div
                          className="text-muted"
                          style={{ fontSize: "0.9rem" }}
                        >
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => decreaseQuantity(item.id)}
                      >
                        -
                      </Button>
                      <span className="mx-2">{item.qty}</span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => increaseQuantity(item.id)}
                      >
                        +
                      </Button>
                    </div>
                    <div className="fw-bold">${item.price}</div>
                    <Button
                      variant="link"
                      className="text-danger p-0"
                      onClick={() => removeItem(item.id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </Col>
        <Col lg={4}>
          <div
            className="bg-white rounded-4 p-4 mb-4"
            style={{ minWidth: 300 }}
          >
            <h5 className="mb-3" style={{ color: "#5e9c8f" }}>
              Card Details
            </h5>
            <Form>
              <Row className="mb-2">
                <Col>
                  <Form.Label className="mb-1">Card Type</Form.Label>
                  <div className="d-flex gap-2">
                    <div
                      style={{
                        width: 32,
                        height: 24,
                        background: "#eee",
                        borderRadius: 4,
                      }}
                    />
                    <div
                      style={{
                        width: 32,
                        height: 24,
                        background: "#eee",
                        borderRadius: 4,
                      }}
                    />
                    <div
                      style={{
                        width: 32,
                        height: 24,
                        background: "#eee",
                        borderRadius: 4,
                      }}
                    />
                    <div
                      style={{
                        width: 32,
                        height: 24,
                        background: "#eee",
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </Col>
              </Row>
              <Form.Group className="mb-2">
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
            </Form>
            <Row className="mt-4">
              <Col>
                <div className="d-flex justify-content-between">
                  <span>Sub Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </Col>
            </Row>
            <Button
              className="w-100 mt-4"
              style={{ background: "#5e9c8f", border: "none" }}
            >
              Check Out <span className="ms-2">&rarr;</span>
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CartCheckOutPage;
