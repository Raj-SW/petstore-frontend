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
import ResetPassword from "./Components/Auth/ResetPassword.jsx";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./Components/Auth/ProtectedRoute";
import RoleBasedRoute from "./Components/Auth/RoleBasedRoute";
import { GlobalToastProvider } from "./context/GlobalToastContext";
import { USER_ROLES } from "./constants/userConstants";

// Admin imports
import AdminLayout from "./Components/Admin/AdminLayout";
import AdminDashboard from "./Pages/Admin/Dashboard/AdminDashboard";
import AdminProducts from "./Pages/Admin/Products/AdminProducts";

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
        element: (
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <RoleBasedRoute allowedRoles={[USER_ROLES.ADMIN]}>
        <AdminLayout />
      </RoleBasedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: "products",
        element: <AdminProducts />,
      },
      {
        path: "products/new",
        element: <div>Product Form - To be implemented</div>,
      },
      {
        path: "products/edit/:id",
        element: <div>Edit Product Form - To be implemented</div>,
      },
      {
        path: "users",
        element: <div>Users Management - To be implemented</div>,
      },
      {
        path: "professionals",
        element: <div>Professionals Management - To be implemented</div>,
      },
      {
        path: "orders",
        element: <div>Orders Management - To be implemented</div>,
      },
      {
        path: "appointments",
        element: <div>Appointments Management - To be implemented</div>,
      },
      {
        path: "analytics",
        element: <div>Analytics - To be implemented</div>,
      },
      {
        path: "settings",
        element: <div>Settings - To be implemented</div>,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <GlobalToastProvider>
    <RouterProvider router={router} />
  </GlobalToastProvider>
);
