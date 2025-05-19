import "./App.css";
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./GlobalCustomStyle.css";
import { Outlet } from "react-router-dom";
import NavigationBar from "./Components/NavigationBar/NavigationBar";
import Footer from "./Components/Footer/Footer";
import { AuthProvider } from "./context/AuthContext";
import CartContext from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import "./context/ToastContext.css";

function App() {
  return (
    <AuthProvider>
      <CartContext>
        <ToastProvider>
          <NavigationBar />
          <Outlet />
          <Footer />
        </ToastProvider>
      </CartContext>
    </AuthProvider>
  );
}

export default App;
