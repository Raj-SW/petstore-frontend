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
