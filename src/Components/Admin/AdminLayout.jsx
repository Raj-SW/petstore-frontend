import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AdminLayout.css";
import {
  FiHome,
  FiUsers,
  FiPackage,
  FiShoppingCart,
  FiCalendar,
  FiBarChart2,
  FiSettings,
  FiMenu,
  FiX,
  FiLogOut,
  FiUserCheck,
  FiBox,
  FiFileText,
  FiCreditCard,
  FiExternalLink,
  FiBookOpen,
  FiSpeaker,
  FiImage,
  FiMail,
  FiMessageSquare,
  FiSend,
  FiHelpCircle,
} from "react-icons/fi";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const menuItems = [
    {
      title: "Dashboard",
      path: "/admin",
      icon: <FiHome className="menu-icon" />,
    },
    {
      title: "Users",
      path: "/admin/users",
      icon: <FiUsers className="menu-icon" />,
    },
    {
      title: "Professionals",
      path: "/admin/professionals",
      icon: <FiUserCheck className="menu-icon" />,
    },
    {
      title: "Products",
      path: "/admin/products",
      icon: <FiPackage className="menu-icon" />,
    },
    {
      title: "Pet Care Tips",
      path: "/admin/tips",
      icon: <FiBookOpen className="menu-icon" />,
    },
    {
      title: "Gallery",
      path: "/admin/gallery",
      icon: <FiImage className="menu-icon" />,
    },
    {
      title: "Contacts",
      path: "/admin/contacts",
      icon: <FiMail className="menu-icon" />,
    },
    {
      title: "Feedback",
      path: "/admin/feedback",
      icon: <FiMessageSquare className="menu-icon" />,
    },
    {
      title: "Announcements",
      path: "/admin/announcements",
      icon: <FiSend className="menu-icon" />,
    },
    {
      title: "FAQs",
      path: "/admin/faqs",
      icon: <FiHelpCircle className="menu-icon" />,
    },
    {
      title: "Adverts",
      path: "/admin/adverts",
      icon: <FiSpeaker className="menu-icon" />,
    },
    {
      title: "Inventory",
      path: "/admin/inventory",
      icon: <FiBox className="menu-icon" />,
    },
    {
      title: "Invoices",
      path: "/admin/invoices",
      icon: <FiFileText className="menu-icon" />,
    },
    {
      title: "Transactions",
      path: "/admin/transactions",
      icon: <FiCreditCard className="menu-icon" />,
    },
    {
      title: "Orders",
      path: "/admin/orders",
      icon: <FiShoppingCart className="menu-icon" />,
    },
    {
      title: "Appointments",
      path: "/admin/appointments",
      icon: <FiCalendar className="menu-icon" />,
    },
    {
      title: "Analytics",
      path: "/admin/analytics",
      icon: <FiBarChart2 className="menu-icon" />,
    },
    {
      title: "Settings",
      path: "/admin/settings",
      icon: <FiSettings className="menu-icon" />,
    },
  ];

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">
            {sidebarOpen ? "VitalPaws Admin" : "VP"}
          </h2>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item) => (
              <li key={item.path} className="nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  title={!sidebarOpen ? item.title : ""}
                >
                  {item.icon}
                  {sidebarOpen && (
                    <span className="nav-text">{item.title}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* External site shortcuts */}
        <div className="sidebar-store-link">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="store-link-btn"
            title="Open Homepage"
          >
            <FiExternalLink className="menu-icon" />
            {sidebarOpen && <span>Homepage</span>}
          </a>
          <a
            href="/petshop"
            target="_blank"
            rel="noopener noreferrer"
            className="store-link-btn"
            title="Open Pet Store"
          >
            <FiExternalLink className="menu-icon" />
            {sidebarOpen && <span>Pet Store</span>}
          </a>
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            {sidebarOpen && (
              <div className="user-details">
                <p className="user-name">{user?.name || "Admin"}</p>
                <p className="user-role">Administrator</p>
              </div>
            )}
          </div>
          <button
            className="logout-button"
            onClick={handleLogout}
            title="Logout"
          >
            <FiLogOut />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main
        className={`admin-main ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
