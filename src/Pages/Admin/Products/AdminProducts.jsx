import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import DataTable from "../../../Components/Admin/DataTable/DataTable";
import productsApi from "../../../Services/api/productsApi";
import { useToast } from "../../../context/ToastContext";
import "./AdminProducts.css";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getProducts({ limit: 1000 });
      const raw = response.data || [];
      // Normalize: ensure `name` is always populated so DataTable search works
      const normalized = raw.map((p) => ({ ...p, name: p.name || p.title || "" }));
      setProducts(normalized);
    } catch (error) {
      addToast("Failed to fetch products", "error");
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      await productsApi.deleteProduct(selectedProduct._id);
      addToast("Product deleted successfully", "success");
      fetchProducts();
      setDeleteModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      addToast("Failed to delete product", "error");
      console.error("Error deleting product:", error);
    }
  };

  const columns = [
    {
      header: "Image",
      accessor: "imageUrl",
      sortable: false,
      searchable: false,
      render: (value, item) => (
        <div className="product-image-cell">
          <img
            src={value || "https://placehold.co/50x50"}
            alt={item.name}
            className="product-thumbnail"
            onError={(e) => {
              e.target.src = "https://placehold.co/50x50";
            }}
          />
        </div>
      ),
    },
    {
      header: "Name",
      accessor: "name",
      render: (value, item) => (
        <span className="product-name">{value || item.title || "—"}</span>
      ),
    },
    {
      header: "Category",
      accessor: "category",
      render: (value) => (
        <span className="product-category">{value || "Uncategorized"}</span>
      ),
    },
    {
      header: "Price",
      accessor: "price",
      render: (value) => (
        <span className="product-price">${value?.toFixed(2) || "0.00"}</span>
      ),
    },
    {
      header: "Stock",
      accessor: "stock",
      render: (value) => (
        <span
          className={`stock-badge ${
            value > 10 ? "in-stock" : value > 0 ? "low-stock" : "out-of-stock"
          }`}
        >
          {value || 0}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "isActive",
      render: (value) => (
        <span className={`status-badge ${value ? "active" : "inactive"}`}>
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Created",
      accessor: "createdAt",
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <motion.div
      className="admin-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">
            Manage your product inventory and listings
          </p>
        </div>
        <Link to="/admin/products/new" className="add-button">
          <FiPlus />
          Add Product
        </Link>
      </div>

      <div className="admin-card">
        <DataTable
          data={products}
          columns={columns}
          loading={loading}
          onEdit={(product) => navigate(`/admin/products/edit/${product._id}`)}
          onDelete={handleDelete}
          onView={(product) => window.open(`/product/${product._id}`, "_blank")}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div
            className="admin-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteModalOpen(false)}
          >
            <motion.div
              className="admin-modal"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="admin-modal-title">Delete Product</h3>
              <p className="admin-modal-msg">
                Are you sure you want to delete &ldquo;{selectedProduct?.title || selectedProduct?.name}&rdquo;? This action cannot be undone.
              </p>
              <div className="admin-modal-actions">
                <button className="admin-modal-btn cancel" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
                <button className="admin-modal-btn confirm" onClick={confirmDelete}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminProducts;
