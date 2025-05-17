import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import AuthenticationPage from "./Pages/AuthenticationPages/AuthenticationPage.jsx";
import HomePage from "./Pages/HomePage/HomePage.jsx";
import IndividualProductItemPage from "./Pages/IndividualProductItemPage/IndividualProductItemPage.jsx";
import PetShopPage from "./Pages/PetShopPage/PetShopPage.jsx";
import ServicePage from "./Pages/ServicePage/ServicePage.jsx";
import AppointmentPage from "./Pages/AppointmentPage/AppointmentPage.jsx";
import CartCheckOutPage from "./Pages/CartCheckoutPage/CartCheckOutPage.jsx";
import ProfessionalCalendar from "./Pages/AppointmentPage/ProfessionalCalendar.jsx";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "home",
        element: <HomePage />,
      },
      {
        path: "authpage",
        element: <AuthenticationPage />,
      },
      {
        path: "product/:id",
        element: <IndividualProductItemPage />,
      },
      {
        path: "PetShop",
        element: <PetShopPage />,
      },
      {
        path: "ServicePage",
        element: <ServicePage />,
      },
      {
        path: "AppointmentPage",
        element: <AppointmentPage />,
      },
      {
        path: "Checkout",
        element: <CartCheckOutPage />,
      },
      {
        path: "calendar/:type/:id",
        element: <ProfessionalCalendar />,
      },
    ],
  },
]);
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);
