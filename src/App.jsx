import "./App.css";
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./GlobalCustomStyle.css";
import { Outlet } from "react-router-dom";
import NavigationBar from "./Components/NavigationBar/NavigationBar";
import Footer from "./Components/Footer/Footer";
import { AuthProvider } from "./context/AuthContext";
import CartContext from "./context/CartContext";

function App() {
  return (
    <AuthProvider>
      <CartContext>
        <NavigationBar />
        <Outlet />
        <Footer />
      </CartContext>
    </AuthProvider>
  );
}

export default App;
