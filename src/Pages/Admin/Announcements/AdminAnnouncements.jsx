import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiTag, FiUsers } from "react-icons/fi";
import DataTable from "../../../Components/Admin/DataTable/DataTable";
import announcementsApi from "../../../Services/api/announcementsApi";
import productsApi from "../../../Services/api/productsApi";
import { useToast } from "../../../context/ToastContext";
import { useCurrency } from "../../../context/CurrencyContext";
import "../Tips/AdminTips.css";
import "./AdminAnnouncements.css";

const AdminAnnouncements = () => {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const { addToast } = useToast();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [prodRes, histRes] = await Promise.all([
        productsApi.getProducts({ limit: 200 }),
        announcementsApi.getAnnouncements(),
      ]);
      const list = Array.isArray(prodRes) ? prodRes : prodRes.data || prodRes.products || [];
      // Default the picker to on-sale products
      setProducts(list.filter((p) => p.onSale));
      setHistory(histRes.data || []);
    } catch {
      addToast("Failed to load products or history", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const canSend = subject.trim().length >= 2 && selectedIds.length > 0 && !sending;

  const selectedProducts = useMemo(
    () => products.filter((p) => selectedIds.includes(p._id)),
    [products, selectedIds]
  );

  const doSend = async () => {
    try {
      setSending(true);
      const res = await announcementsApi.createAnnouncement({
        subject: subject.trim(),
        message: message.trim(),
        productIds: selectedIds,
        source: "composer",
      });
      addToast(res.message || "Announcement sent", "success");
      setSubject("");
      setMessage("");
      setSelectedIds([]);
      setConfirmOpen(false);
      fetchAll();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to send announcement", "error");
    } finally {
      setSending(false);
    }
  };

  const columns = [
    { header: "Subject", accessor: "subject" },
    {
      header: "Products",
      accessor: "products",
      sortable: false,
      render: (value) => <span className="at-pill">{Array.isArray(value) ? value.length : 0}</span>,
    },
    {
      header: "Sent / Audience",
      accessor: "sentCount",
      sortable: false,
      render: (value, item) => `${value ?? 0} / ${item.audienceCount ?? 0}`,
    },
    { header: "Source", accessor: "source" },
    {
      header: "Date",
      accessor: "createdAt",
      render: (value) => (value ? new Date(value).toLocaleDateString() : "—"),
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
          <h1 className="admin-page-title">Sale Announcements</h1>
          <p className="admin-page-subtitle">
            Email registered customers about products on sale.
          </p>
        </div>
      </div>

      <div className="aa-composer">
        <input
          className="aa-input"
          placeholder="Email subject (e.g. Weekend Dog Food Sale)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea
          className="aa-textarea"
          placeholder="Optional message shown above the products…"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <p className="aa-section-label">
          <FiTag /> On-sale products {products.length === 0 && !loading && "— none currently on sale"}
        </p>
        <div className="aa-product-grid">
          {products.map((p) => {
            const checked = selectedIds.includes(p._id);
            return (
              <label key={p._id} className={`aa-product ${checked ? "on" : ""}`}>
                <input
                  type="checkbox"
                  aria-label={`select ${p.name}`}
                  checked={checked}
                  onChange={() => toggleProduct(p._id)}
                />
                <span className="aa-product-name">{p.name}</span>
                <span className="aa-product-price">
                  {p.salePrice ? formatPrice(p.salePrice) : formatPrice(p.price)}
                </span>
              </label>
            );
          })}
        </div>

        <button
          className="at-btn-primary aa-send"
          disabled={!canSend}
          onClick={() => setConfirmOpen(true)}
        >
          <FiSend /> Send announcement
        </button>
      </div>

      <h2 className="aa-history-title">Past announcements</h2>
      <DataTable data={history} columns={columns} loading={loading} />

      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            className="admin-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmOpen(false)}
          >
            <motion.div
              className="admin-modal"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>
                <FiUsers /> Send to all subscribed customers?
              </h3>
              <p>
                &ldquo;{subject}&rdquo; featuring {selectedProducts.length} product
                {selectedProducts.length === 1 ? "" : "s"} will be emailed to every customer
                who has sale emails enabled.
              </p>
              <div className="admin-modal-actions">
                <button className="at-btn-secondary" onClick={() => setConfirmOpen(false)}>
                  Cancel
                </button>
                <button className="at-btn-primary" disabled={sending} onClick={doSend}>
                  Send
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminAnnouncements;
