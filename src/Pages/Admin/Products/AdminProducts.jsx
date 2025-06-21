import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  const { showToast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getProducts({ limit: 1000 });
      setProducts(response.data || []);
    } catch (error) {
      showToast("error", "Failed to fetch products");
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
      showToast("success", "Product deleted successfully");
      fetchProducts(); // Refresh the list
      setDeleteModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      showToast("error", "Failed to delete product");
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
            src={value || "/api/placeholder/50/50"}
            alt={item.name}
            className="product-thumbnail"
            onError={(e) => {
              e.target.src = "/api/placeholder/50/50";
            }}
          />
        </div>
      ),
    },
    {
      header: "Name",
      accessor: "name",
      render: (value) => <span className="product-name">{value}</span>,
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
    <div className="admin-page">
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
          onEdit={(product) =>
            (window.location.href = `/admin/products/edit/${product._id}`)
          }
          onDelete={handleDelete}
          onView={(product) => window.open(`/product/${product._id}`, "_blank")}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setDeleteModalOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Delete Product</h3>
            <p className="modal-message">
              Are you sure you want to delete "{selectedProduct?.name}"? This
              action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="modal-button cancel"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button className="modal-button confirm" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
