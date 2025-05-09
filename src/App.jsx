import "./App.css";
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./GlobalCustomStyle.css";
import { Outlet } from "react-router-dom";
import NavigationBar from "./Components/NavigationBar/NavigationBar";
import Footer from "./Components/Footer/Footer";
function App() {
  return (
    <>
      <NavigationBar />
      <Outlet />
      <Footer />
    </>
  );
}

export default App;
