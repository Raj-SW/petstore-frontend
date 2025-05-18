import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import HomePage from "./Pages/HomePage/HomePage.jsx";
import IndividualProductItemPage from "./Pages/IndividualProductItemPage/IndividualProductItemPage.jsx";
import PetShopPage from "./Pages/PetShopPage/PetShopPage.jsx";
import ServicePage from "./Pages/ServicePage/ServicePage.jsx";
import AppointmentPage from "./Pages/AppointmentPage/AppointmentPage.jsx";
import CartCheckOutPage from "./Pages/CartCheckoutPage/CartCheckOutPage.jsx";
import ImportExportServicePage from "./Pages/ImportExport/ImportExportServicePage.jsx";
import ExportImportForm from "./Pages/ImportExport/Import/ImportPage.jsx";
import UserProfile from "./Pages/UserProfile.jsx";
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
        path: "product/:id",
        element: <IndividualProductItemPage />,
      },
      {
        path: "petshop",
        element: <PetShopPage />,
      },
      {
        path: "services",
        element: <ServicePage />,
      },
      {
        path: "appointments",
        element: <AppointmentPage />,
      },
      {
        path: "checkout",
        element: <CartCheckOutPage />,
      },
      {
        path: "import-export-service",
        element: <ImportExportServicePage />,
      },
      {
        path: "import-page",
        element: <ExportImportForm />,
      },
      {
        path: "profile",
        element: <UserProfile />,
      },
    ],
  },
]);
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);
