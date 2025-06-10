import { Modal, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useCart } from "react-use-cart";
import { useToast } from "../../context/ToastContext";
import { CartItem } from "../HelperComponents/CartItem/CartItem";
import { BsCreditCard, BsArrowLeft } from "react-icons/bs";
import "./CartModal.css";

const CartModal = ({ show, onHide }) => {
  const navigate = useNavigate();
  const { items, cartTotal, totalItems, updateItemQuantity, removeItem } =
    useCart();
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
      removeItem(itemId);
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    updateItemQuantity(itemId, newQuantity);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      className="cart-modal shadow-lg"
    >
      <Modal.Header className="border-0 pb-0">
        <Modal.Title className="cart-modal-title poppins-semibold d-flex align-items-center">
          <div className="d-flex align-items-center"></div>
          Shopping Cart ({totalItems} items)
        </Modal.Title>
        <Button variant="link" className="p-0 ms-auto" onClick={onHide}>
          <BsArrowLeft size={32} className="primary-color-font " />
        </Button>
      </Modal.Header>
      <Modal.Body className="px-4">
        {items.length === 0 ? (
          <div className="empty-cart d-flex flex-column align-items-center justify-content-center p-5">
            <div className="empty-cart-icon mb-4">
              <i className="bi bi-cart-x display-1 primary-color-font opacity-50"></i>
            </div>
            <h4 className="poppins-medium primary-color-font mb-3">
              Your cart is empty
            </h4>
            <p className="text-muted text-center mb-4 poppins-regular">
              Looks like you haven&apos;t added anything to your cart yet.
              <br />
              Browse our products and start shopping!
            </p>
          </div>
        ) : (
          <Row>
            <Col className="">
              <div className="cart-items-container bg-white rounded-3 ">
                <h5 className="mb-4 poppins-semibold">Cart Items</h5>
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
            <Col lg={4}>
              <div className="order-summary rounded-3 shadow-sm p-3">
                <h5 className="mb-4 poppins-semibold">Order Summary</h5>
                <div className="summary-row poppins-regular">
                  <span>Subtotal:</span>
                  <span className="text-secondary">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <div className="summary-row poppins-regular">
                  <span>Shipping:</span>
                  <span className="text-secondary">
                    ${(cartTotal > 0 ? 20 : 0).toFixed(2)}
                  </span>
                </div>
                <div className="summary-row total poppins-semibold">
                  <span>Total:</span>
                  <span className="primary-color-font">
                    ${(cartTotal + (cartTotal > 0 ? 20 : 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0">
        {items.length === 0 ? (
          <Button
            className="rounded-pill px-4 py-2 button-primary shadow-sm"
            onClick={onHide}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Continue Shopping
          </Button>
        ) : (
          <>
            <Button
              className="rounded-pill px-4 py-2 shadow-sm"
              onClick={onHide}
            >
              <BsArrowLeft className="me-2" />
              Continue Shopping
            </Button>
            <Button
              className="rounded-pill px-4 py-2 button-primary shadow-sm"
              onClick={handleCheckout}
            >
              <BsCreditCard className="me-2" />
              Proceed to Checkout
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default CartModal;
