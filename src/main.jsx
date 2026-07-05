import { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
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
import LoadingSpinner from "./Components/HelperComponents/LoadingSpinner/LoadingSpinner";

// Admin layout stays eager — always needed the instant any /admin/* route
// matches (sidebar/shell). Every admin PAGE below is lazy: none of this
// bundle (Tiptap, dnd-kit, chart libs, etc.) should load for a storefront visit.
import AdminLayout from "./Components/Admin/AdminLayout";

// ── Storefront pages (route-based code splitting) ───────────────────────────
const HomePage                  = lazy(() => import("./Pages/HomePage/HomePage.jsx"));
const IndividualProductItemPage = lazy(() => import("./Pages/IndividualProductItemPage/IndividualProductItemPage.jsx"));
const PetShopPage               = lazy(() => import("./Pages/PetShopPage/PetShopPage.jsx"));
const ServicePage               = lazy(() => import("./Pages/ServicePage/ServicePage.jsx"));
const AppointmentPage           = lazy(() => import("./Pages/AppointmentPage/AppointmentPage.jsx"));
const ProfessionalDetailPage    = lazy(() => import("./Pages/AppointmentPage/ProfessionalDetailPage.jsx"));
const CartCheckOutPage          = lazy(() => import("./Pages/CartCheckoutPage/CartCheckOutPage.jsx"));
const ImportExportServicePage   = lazy(() => import("./Pages/ImportExport/ImportExportServicePage.jsx"));
const ExportImportForm          = lazy(() => import("./Pages/ImportExport/Import/ImportPage.jsx"));
const UserProfile               = lazy(() => import("./Pages/UserProfile.jsx"));
const ResetPassword             = lazy(() => import("./Components/Auth/ResetPassword.jsx"));
const PaymentPage               = lazy(() => import("./Pages/Payment/PaymentPage.jsx"));
const MyOrdersPage              = lazy(() => import("./Pages/MyOrders/MyOrdersPage.jsx"));
const OrderConfirmedPage        = lazy(() => import("./Pages/OrderConfirmed/OrderConfirmedPage.jsx"));
const PetCareTipsPage           = lazy(() => import("./Pages/PetCareTips/PetCareTipsPage.jsx"));
const TipDetailPage             = lazy(() => import("./Pages/PetCareTips/TipDetailPage.jsx"));
const GalleryPage               = lazy(() => import("./Pages/Gallery/GalleryPage.jsx"));
const GalleryDetailPage         = lazy(() => import("./Pages/Gallery/GalleryDetailPage.jsx"));
const ContactPage               = lazy(() => import("./Pages/Contact/ContactPage.jsx"));
const AboutPage                 = lazy(() => import("./Pages/About/AboutPage.jsx"));
const MySubscriptions           = lazy(() => import("./Pages/Subscriptions/MySubscriptions.jsx"));

// ── Admin pages (route-based code splitting) ────────────────────────────────
const AdminDashboard      = lazy(() => import("./Pages/Admin/Dashboard/AdminDashboard"));
const AdminProducts       = lazy(() => import("./Pages/Admin/Products/AdminProducts"));
const AdminProductForm    = lazy(() => import("./Pages/Admin/Products/AdminProductForm"));
const AdminUsers          = lazy(() => import("./Pages/Admin/Users/AdminUsers"));
const AdminOrders         = lazy(() => import("./Pages/Admin/Orders/AdminOrders"));
const AdminAppointments   = lazy(() => import("./Pages/Admin/Appointments/AdminAppointments"));
const AdminAnalytics      = lazy(() => import("./Pages/Admin/Analytics/AdminAnalytics"));
const AdminSettings       = lazy(() => import("./Pages/Admin/Settings/AdminSettings"));
const AdminInventory      = lazy(() => import("./Pages/Admin/Inventory/AdminInventory.jsx"));
const AdminInvoices       = lazy(() => import("./Pages/Admin/Invoices/AdminInvoices.jsx"));
const AdminTransactions   = lazy(() => import("./Pages/Admin/Transactions/AdminTransactions.jsx"));
const AdminTips           = lazy(() => import("./Pages/Admin/Tips/AdminTips"));
const AdminTipForm        = lazy(() => import("./Pages/Admin/Tips/AdminTipForm"));
const AdminGallery        = lazy(() => import("./Pages/Admin/Gallery/AdminGallery"));
const AdminGalleryForm    = lazy(() => import("./Pages/Admin/Gallery/AdminGalleryForm"));
const AdminContacts       = lazy(() => import("./Pages/Admin/Contacts/AdminContacts"));
const AdminAdverts        = lazy(() => import("./Pages/Admin/Adverts/AdminAdverts"));
const AdminFeedback       = lazy(() => import("./Pages/Admin/Feedback/AdminFeedback"));
const AdminAnnouncements  = lazy(() => import("./Pages/Admin/Announcements/AdminAnnouncements"));
const AdminFaqs           = lazy(() => import("./Pages/Admin/Faqs/AdminFaqs"));
const AdminSubscriptions  = lazy(() => import("./Pages/Admin/Subscriptions/AdminSubscriptions"));
const AdminUIGallery      = lazy(() => import("./Pages/Admin/UIGallery/AdminUIGallery"));

// Every lazy page is wrapped in the same Suspense boundary so route
// transitions show one consistent fallback instead of each page needing
// its own — cheap to add per-element, keeps main.jsx from growing 3x.
const P = (el) => <Suspense fallback={<LoadingSpinner />}>{el}</Suspense>;

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: P(<HomePage />),
      },
      {
        path: "home",
        element: P(<HomePage />),
      },
      {
        path: "product/:id",
        element: P(<IndividualProductItemPage />),
      },
      {
        path: "petshop",
        element: P(<PetShopPage />),
      },
      {
        path: "services",
        element: P(<ServicePage />),
      },
      {
        path: "appointments",
        element: P(<AppointmentPage />),
      },
      {
        path: "appointments/professional/:id",
        element: P(<ProfessionalDetailPage />),
      },
      {
        path: "pet-care-tips",
        element: P(<PetCareTipsPage />),
      },
      {
        path: "pet-care-tips/:slug",
        element: P(<TipDetailPage />),
      },
      {
        path: "gallery",
        element: P(<GalleryPage />),
      },
      {
        path: "gallery/:slug",
        element: P(<GalleryDetailPage />),
      },
      {
        path: "contact",
        element: P(<ContactPage />),
      },
      {
        path: "about",
        element: P(<AboutPage />),
      },
      {
        path: "checkout",
        element: P(
          <ProtectedRoute>
            <CartCheckOutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "payment/:orderId",
        element: P(
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-orders",
        element: P(
          <ProtectedRoute>
            <MyOrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-subscriptions",
        element: P(
          <ProtectedRoute>
            <MySubscriptions />
          </ProtectedRoute>
        ),
      },
      {
        path: "order-confirmed/:orderId",
        element: P(
          <ProtectedRoute>
            <OrderConfirmedPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "import-export-service",
        element: P(<ImportExportServicePage />),
      },
      {
        path: "import-page",
        element: P(<ExportImportForm />),
      },
      {
        path: "profile",
        element: P(
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "reset-password",
        element: P(<ResetPassword />),
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
        element: P(<AdminDashboard />),
      },
      {
        path: "products",
        element: P(<AdminProducts />),
      },
      {
        path: "products/new",
        element: P(<AdminProductForm />),
      },
      {
        path: "products/edit/:id",
        element: P(<AdminProductForm />),
      },
      {
        path: "tips",
        element: P(<AdminTips />),
      },
      {
        path: "tips/new",
        element: P(<AdminTipForm />),
      },
      {
        path: "tips/edit/:id",
        element: P(<AdminTipForm />),
      },
      {
        path: "gallery",
        element: P(<AdminGallery />),
      },
      {
        path: "gallery/new",
        element: P(<AdminGalleryForm />),
      },
      {
        path: "gallery/edit/:id",
        element: P(<AdminGalleryForm />),
      },
      {
        path: "contacts",
        element: P(<AdminContacts />),
      },
      {
        path: "adverts",
        element: P(<AdminAdverts />),
      },
      {
        path: "feedback",
        element: P(<AdminFeedback />),
      },
      {
        path: "announcements",
        element: P(<AdminAnnouncements />),
      },
      {
        path: "faqs",
        element: P(<AdminFaqs />),
      },
      {
        path: "subscriptions",
        element: P(<AdminSubscriptions />),
      },
      {
        path: "inventory",
        element: P(<AdminInventory />),
      },
      {
        path: "invoices",
        element: P(<AdminInvoices />),
      },
      {
        path: "transactions",
        element: P(<AdminTransactions />),
      },
      {
        path: "users",
        element: P(<AdminUsers />),
      },
      {
        path: "professionals",
        element: <div>Professionals Management - To be implemented</div>,
      },
      {
        path: "orders",
        element: P(<AdminOrders />),
      },
      {
        path: "appointments",
        element: P(<AdminAppointments />),
      },
      {
        path: "analytics",
        element: P(<AdminAnalytics />),
      },
      {
        path: "settings",
        element: P(<AdminSettings />),
      },
      {
        path: "ui-gallery",
        element: P(<AdminUIGallery />),
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
