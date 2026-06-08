import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiDollarSign, FiShoppingCart, FiPackage, FiUsers, FiTrendingUp } from "react-icons/fi";
import { api } from "../../../core/api/apiClient";
import { useToast } from "../../../context/ToastContext";
import "./AdminAnalytics.css";

const MONTHLY_PLACEHOLDER = [
  { month: "Jan", revenue: 3200, orders: 28 },
  { month: "Feb", revenue: 4100, orders: 35 },
  { month: "Mar", revenue: 3800, orders: 31 },
  { month: "Apr", revenue: 5200, orders: 44 },
  { month: "May", revenue: 4700, orders: 40 },
  { month: "Jun", revenue: 6100, orders: 52 },
  { month: "Jul", revenue: 5500, orders: 47 },
  { month: "Aug", revenue: 6800, orders: 58 },
  { month: "Sep", revenue: 7200, orders: 62 },
  { month: "Oct", revenue: 6500, orders: 55 },
  { month: "Nov", revenue: 8100, orders: 70 },
  { month: "Dec", revenue: 9400, orders: 80 },
];

const CATEGORIES = ["dogs", "cats", "fish", "birds", "general", "apparel"];

const AdminAnalytics = () => {
  const { addToast } = useToast();

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    avgOrderValue: 0,
    ordersThisMonth: 0,
    topCategory: "—",
  });
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      const [ordersStatsRes, productsRes, usersRes, topProductsRes] =
        await Promise.allSettled([
          api.get("/orders/stats"),
          api.get("/products?limit=1"),
          api.get("/users?limit=1"),
          api.get("/products?limit=5&sort=-createdAt"),
        ]);

      const orderStats =
        ordersStatsRes.status === "fulfilled"
          ? ordersStatsRes.value?.data
          : null;

      const totalRevenue = orderStats?.totalRevenue ?? 0;
      const totalOrders = orderStats?.totalOrders ?? 0;
      const ordersThisMonth = orderStats?.ordersThisMonth ?? 0;
      const avgOrderValue =
        totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const totalProducts =
        productsRes.status === "fulfilled"
          ? productsRes.value?.data?.pagination?.total ?? 0
          : 0;

      const totalUsers =
        usersRes.status === "fulfilled"
          ? usersRes.value?.data?.pagination?.total ?? 0
          : 0;

      const products =
        topProductsRes.status === "fulfilled"
          ? topProductsRes.value?.data?.data ?? []
          : [];
      setTopProducts(products);

      // Derive most popular category from the fetched top products
      const categoryCount = {};
      products.forEach((p) => {
        if (p.category) {
          categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
        }
      });
      const topCategory =
        Object.keys(categoryCount).sort(
          (a, b) => categoryCount[b] - categoryCount[a]
        )[0] ?? "—";

      setStats({
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        avgOrderValue,
        ordersThisMonth,
        topCategory,
      });
    } catch (err) {
      addToast("Failed to load analytics data.", "error");
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const maxRevenue = Math.max(...MONTHLY_PLACEHOLDER.map((m) => m.revenue));
  const maxOrders = Math.max(...MONTHLY_PLACEHOLDER.map((m) => m.orders));

  return (
    <motion.div
      className="admin-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="admin-page-header">
        <h1 className="admin-page-title">Analytics</h1>
        <p className="admin-page-subtitle">
          An overview of platform performance and key metrics.
        </p>
      </div>

      {/* Top stat cards */}
      <div className="admin-stats-grid">
        <StatCard
          icon={<FiDollarSign />}
          label="Total Revenue"
          value={`Rs ${Math.round(stats.totalRevenue).toLocaleString('en-US')}`}
          color="primary"
          loading={loading}
        />
        <StatCard
          icon={<FiShoppingCart />}
          label="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          color="info"
          loading={loading}
        />
        <StatCard
          icon={<FiPackage />}
          label="Total Products"
          value={stats.totalProducts.toLocaleString()}
          color="warning"
          loading={loading}
        />
        <StatCard
          icon={<FiUsers />}
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          color="success"
          loading={loading}
        />
      </div>

      {/* Charts section */}
      <div className="admin-analytics-grid">
        {/* Monthly Revenue Bar Chart */}
        <div className="admin-card admin-chart-card">
          <div className="admin-chart-header">
            <h2 className="admin-chart-title">Monthly Revenue</h2>
            <span className="admin-chart-note">Indicative data</span>
          </div>
          <div className="bar-chart" role="img" aria-label="Monthly revenue bar chart">
            {MONTHLY_PLACEHOLDER.map((m) => (
              <div key={m.month} className="bar-col">
                <div
                  className="bar"
                  style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                  title={`${m.month}: Rs ${Math.round(m.revenue).toLocaleString('en-US')}`}
                />
                <span className="bar-label">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Orders Bar Chart */}
        <div className="admin-card admin-chart-card">
          <div className="admin-chart-header">
            <h2 className="admin-chart-title">Monthly Orders</h2>
            <span className="admin-chart-note">Indicative data</span>
          </div>
          <div className="bar-chart" role="img" aria-label="Monthly orders bar chart">
            {MONTHLY_PLACEHOLDER.map((m) => (
              <div key={m.month} className="bar-col">
                <div
                  className="bar bar--orders"
                  style={{ height: `${(m.orders / maxOrders) * 100}%` }}
                  title={`${m.month}: ${m.orders} orders`}
                />
                <span className="bar-label">{m.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="admin-quick-stats">
        <div className="admin-card admin-quick-stat-card">
          <FiTrendingUp className="admin-qs-icon" />
          <div>
            <p className="admin-qs-label">Avg. Order Value</p>
            <p className="admin-qs-value">
              {loading
                ? "—"
                : `Rs ${Math.round(stats.avgOrderValue).toLocaleString('en-US')}`}
            </p>
          </div>
        </div>
        <div className="admin-card admin-quick-stat-card">
          <FiShoppingCart className="admin-qs-icon" />
          <div>
            <p className="admin-qs-label">Orders This Month</p>
            <p className="admin-qs-value">
              {loading ? "—" : stats.ordersThisMonth.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="admin-card admin-quick-stat-card">
          <FiPackage className="admin-qs-icon" />
          <div>
            <p className="admin-qs-label">Most Popular Category</p>
            <p className="admin-qs-value admin-qs-value--cap">
              {loading ? "—" : stats.topCategory}
            </p>
          </div>
        </div>
      </div>

      {/* Top Products table */}
      <div className="admin-card">
        <div className="admin-chart-header" style={{ marginBottom: "1.2rem" }}>
          <h2 className="admin-chart-title">Top Products</h2>
          <span className="admin-chart-note">Sorted by newest</span>
        </div>
        {loading ? (
          <p className="admin-no-data">Loading…</p>
        ) : topProducts.length === 0 ? (
          <p className="admin-no-data">No products found.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-analytics-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, i) => (
                  <tr key={product._id}>
                    <td className="admin-table-idx">{i + 1}</td>
                    <td className="admin-table-name">{product.name || product.title || "—"}</td>
                    <td>
                      <span className="admin-category-badge">
                        {product.category || "—"}
                      </span>
                    </td>
                    <td className="admin-table-price">
                      ${(product.price ?? 0).toFixed(2)}
                    </td>
                    <td>{product.stock ?? product.quantity ?? "—"}</td>
                    <td>
                      <span
                        className={`admin-status-dot ${
                          product.isActive ? "active" : "inactive"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon, label, value, color, loading }) => (
  <div className="stat-card">
    <div className={`stat-icon ${color}`}>{icon}</div>
    <div className="stat-content">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{loading ? "—" : value}</p>
    </div>
  </div>
);

export default AdminAnalytics;
