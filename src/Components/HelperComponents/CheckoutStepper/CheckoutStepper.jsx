import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaShoppingCart, FaTruck, FaCreditCard, FaCheck } from "react-icons/fa";
import "./CheckoutStepper.css";

const STEPS = [
  { id: 1, label: "Cart",     Icon: FaShoppingCart },
  { id: 2, label: "Shipping", Icon: FaTruck },
  { id: 3, label: "Payment",  Icon: FaCreditCard },
];

const CheckoutStepper = ({ currentStep }) => (
  <nav className="cstepper" aria-label="Checkout progress">
    {STEPS.map((step, i) => {
      const { id, label, Icon } = step;
      const done   = currentStep > id;
      const active = currentStep === id;
      let nodeModifier;
      if (done) nodeModifier = " done";
      else if (active) nodeModifier = " active";
      else nodeModifier = " pending";
      const nodeClass = `cstepper-node${nodeModifier}`;

      let labelModifier;
      if (done) labelModifier = " done";
      else if (active) labelModifier = " active";
      else labelModifier = "";
      const labelClass = `cstepper-label${labelModifier}`;

      return (
        <React.Fragment key={id}>
          {i > 0 && (
            <div className="cstepper-conn" aria-hidden="true">
              <motion.div
                className="cstepper-conn-fill"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: done ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 160, damping: 24, delay: done ? 0.15 : 0 }}
                style={{ transformOrigin: "left center" }}
              />
            </div>
          )}

          <div
            className="cstepper-step"
            aria-current={active ? "step" : undefined}
          >
            <motion.div
              className={nodeClass}
              animate={{ scale: active ? 1.12 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 14 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {done ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  >
                    <FaCheck size={15} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="icon"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Icon size={16} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            <span className={labelClass}>
              {label}
            </span>
          </div>
        </React.Fragment>
      );
    })}
  </nav>
);

export default CheckoutStepper;
