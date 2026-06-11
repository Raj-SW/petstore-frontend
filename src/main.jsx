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
import PaymentPage from "./Pages/Payment/PaymentPage.jsx";
import MyOrdersPage from "./Pages/MyOrders/MyOrdersPage.jsx";
import OrderConfirmedPage from "./Pages/OrderConfirmed/OrderConfirmedPage.jsx";
import PetCareTipsPage from "./Pages/PetCareTips/PetCareTipsPage.jsx";
import TipDetailPage from "./Pages/PetCareTips/TipDetailPage.jsx";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./Components/Auth/ProtectedRoute";
import RoleBasedRoute from "./Components/Auth/RoleBasedRoute";
import { GlobalToastProvider } from "./context/GlobalToastContext";
import { AuthProvider } from "./context/AuthContext";
import CartContext from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import "./context/ToastContext.css";
import { USER_ROLES } from "./constants/userConstants";

// Admin imports
import AdminLayout from "./Components/Admin/AdminLayout";
import AdminDashboard from "./Pages/Admin/Dashboard/AdminDashboard";
import AdminProducts from "./Pages/Admin/Products/AdminProducts";
import AdminProductForm from "./Pages/Admin/Products/AdminProductForm";
import AdminUsers from "./Pages/Admin/Users/AdminUsers";
import AdminOrders from "./Pages/Admin/Orders/AdminOrders";
import AdminAppointments from "./Pages/Admin/Appointments/AdminAppointments";
import AdminAnalytics from "./Pages/Admin/Analytics/AdminAnalytics";
import AdminSettings from "./Pages/Admin/Settings/AdminSettings";
import AdminInventory     from "./Pages/Admin/Inventory/AdminInventory.jsx";
import AdminInvoices     from "./Pages/Admin/Invoices/AdminInvoices.jsx";
import AdminTransactions from "./Pages/Admin/Transactions/AdminTransactions.jsx";
import AdminTips from "./Pages/Admin/Tips/AdminTips";

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
        path: "pet-care-tips",
        element: <PetCareTipsPage />,
      },
      {
        path: "pet-care-tips/:slug",
        element: <TipDetailPage />,
      },
      {
        path: "checkout",
        element: (
          <ProtectedRoute>
            <CartCheckOutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "payment/:orderId",
        element: (
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-orders",
        element: (
          <ProtectedRoute>
            <MyOrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "order-confirmed/:orderId",
        element: (
          <ProtectedRoute>
            <OrderConfirmedPage />
          </ProtectedRoute>
        ),
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
        element: <AdminProductForm />,
      },
      {
        path: "products/edit/:id",
        element: <AdminProductForm />,
      },
      {
        path: "tips",
        element: <AdminTips />,
      },
      {
        path: "inventory",
        element: <AdminInventory />,
      },
      {
        path: "invoices",
        element: <AdminInvoices />,
      },
      {
        path: "transactions",
        element: <AdminTransactions />,
      },
      {
        path: "users",
        element: <AdminUsers />,
      },
      {
        path: "professionals",
        element: <div>Professionals Management - To be implemented</div>,
      },
      {
        path: "orders",
        element: <AdminOrders />,
      },
      {
        path: "appointments",
        element: <AdminAppointments />,
      },
      {
        path: "analytics",
        element: <AdminAnalytics />,
      },
      {
        path: "settings",
        element: <AdminSettings />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <GlobalToastProvider>
    <AuthProvider>
      <CurrencyProvider>
        <CartContext>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </CartContext>
      </CurrencyProvider>
    </AuthProvider>
  </GlobalToastProvider>
);
