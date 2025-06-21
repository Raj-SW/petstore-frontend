import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiPackage,
  FiShoppingCart,
  FiCalendar,
  FiDollarSign,
  FiTrendingUp,
  FiActivity,
  FiUserCheck,
} from "react-icons/fi";
import { api } from "../../../core/api/apiClient";
import LoadingSpinner from "../../../Components/HelperComponents/LoadingSpinner/LoadingSpinner";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProfessionals: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    recentOrders: [],
    recentAppointments: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // In a real app, you'd have a dedicated dashboard endpoint
      // For now, we'll simulate with multiple API calls
      const [usersRes, productsRes, ordersRes, appointmentsRes] =
        await Promise.all([
          api.get("/users?limit=5"),
          api.get("/products?limit=5"),
          api.get("/orders?limit=5&sortBy=createdAt&sortOrder=desc"),
          api.get("/appointments?limit=5&sortBy=createdAt&sortOrder=desc"),
        ]);

      setStats({
        totalUsers: usersRes.data?.pagination?.total || 0,
        totalProfessionals: 0, // Would come from professionals endpoint
        totalProducts: productsRes.data?.pagination?.total || 0,
        totalOrders: ordersRes.data?.pagination?.total || 0,
        totalAppointments: appointmentsRes.data?.pagination?.total || 0,
        totalRevenue: 0, // Would be calculated from orders
        recentOrders: ordersRes.data?.data || [],
        recentAppointments: appointmentsRes.data?.data || [],
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <FiUsers />,
      color: "primary",
      link: "/admin/users",
    },
    {
      title: "Professionals",
      value: stats.totalProfessionals,
      icon: <FiUserCheck />,
      color: "success",
      link: "/admin/professionals",
    },
    {
      title: "Products",
      value: stats.totalProducts,
      icon: <FiPackage />,
      color: "warning",
      link: "/admin/products",
    },
    {
      title: "Orders",
      value: stats.totalOrders,
      icon: <FiShoppingCart />,
      color: "info",
      link: "/admin/orders",
    },
    {
      title: "Appointments",
      value: stats.totalAppointments,
      icon: <FiCalendar />,
      color: "primary",
      link: "/admin/appointments",
    },
    {
      title: "Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: <FiDollarSign />,
      color: "success",
      link: "/admin/analytics",
    },
  ];

  if (loading) {
    return (
      <div className="admin-page">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">
          Welcome back! Here's what's happening with your platform today.
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="admin-stats-grid">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="stat-card-link"
            aria-label={`View ${stat.title}`}
          >
            <div className="stat-card">
              <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
              <div className="stat-content">
                <p className="stat-label">{stat.title}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="admin-grid">
        {/* Recent Orders */}
        <div className="admin-card">
          <div className="card-header">
            <h2 className="card-title">
              <FiShoppingCart className="card-icon" />
              Recent Orders
            </h2>
            <Link to="/admin/orders" className="view-all-link">
              View All
            </Link>
          </div>
          <div className="recent-items">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order._id} className="recent-item">
                  <div className="item-info">
                    <p className="item-title">Order #{order._id.slice(-6)}</p>
                    <p className="item-subtitle">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="item-status">
                    <span
                      className={`status-badge ${order.status?.toLowerCase()}`}
                    >
                      {order.status}
                    </span>
                    <p className="item-amount">
                      ${order.totalAmount?.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No recent orders</p>
            )}
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="admin-card">
          <div className="card-header">
            <h2 className="card-title">
              <FiCalendar className="card-icon" />
              Recent Appointments
            </h2>
            <Link to="/admin/appointments" className="view-all-link">
              View All
            </Link>
          </div>
          <div className="recent-items">
            {stats.recentAppointments.length > 0 ? (
              stats.recentAppointments.map((appointment) => (
                <div key={appointment._id} className="recent-item">
                  <div className="item-info">
                    <p className="item-title">{appointment.professionalName}</p>
                    <p className="item-subtitle">
                      {new Date(appointment.dateTime).toLocaleDateString()} at{" "}
                      {new Date(appointment.dateTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="item-status">
                    <span
                      className={`status-badge ${appointment.status?.toLowerCase()}`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No recent appointments</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <h2 className="card-title">
          <FiActivity className="card-icon" />
          Quick Actions
        </h2>
        <div className="quick-actions">
          <Link to="/admin/products/new" className="action-button primary">
            Add New Product
          </Link>
          <Link to="/admin/users" className="action-button secondary">
            Manage Users
          </Link>
          <Link to="/admin/appointments" className="action-button success">
            View Appointments
          </Link>
          <Link to="/admin/analytics" className="action-button info">
            View Analytics
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
