import React from "react";
import { CartProvider as UseCartProvider } from "react-use-cart";

const CartContext = ({ children }) => {
  return (
    <UseCartProvider
      defaultItems={[]}
      defaultQuantity={1}
      defaultTotalItems={0}
      defaultTotalUniqueItems={0}
      defaultCartTotal={0}
    >
      {children}
    </UseCartProvider>
  );
};

export default CartContext;
