import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import {
  FiFileText, FiDollarSign, FiRotateCcw,
  FiDownload, FiEye, FiX, FiRefreshCw, FiSearch,
} from "react-icons/fi";
import invoiceApi from "../../../Services/api/invoiceApi";
import { useToast } from "../../../context/ToastContext";
import "./AdminInvoices.css";

const STATUS_OPTS = [
  { value: "all",      label: "All Statuses" },
  { value: "issued",   label: "Issued" },
  { value: "refunded", label: "Refunded" },
];

const STATUS_BADGE = {
  issued:   { cls: "inv-status--issued",   label: "Issued" },
  refunded: { cls: "inv-status--refunded", label: "Refunded" },
};

const EMPTY_DRAWER = { open: false, invoice: null };

export default function AdminInvoices() {
  const { addToast } = useToast();

  const [invoices,    setInvoices]    = useState([]);
  const [stats,       setStats]       = useState({ totalIssued: 0, totalRevenue: 0, totalRefunded: 0 });
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [status,      setStatus]      = useState("all");
  const [drawer,      setDrawer]      = useState(EMPTY_DRAWER);
  const [pdfLoading,  setPdfLoading]  = useState(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await invoiceApi.getInvoices({
        search: search || undefined,
        status: status === "all" ? undefined : status,
        limit: 100,
      });
      setInvoices(res.data  || []);
      if (res.stats) setStats(res.stats);
    } catch {
      addToast("Failed to load invoices", "error");
    } finally {
      setLoading(false);
    }
  }, [search, status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const handlePDF = async (inv) => {
    setPdfLoading(inv._id);
    try {
      await invoiceApi.downloadPDF(inv._id, inv.invoiceNumber);
    } catch {
      addToast("PDF download failed", "error");
    } finally {
      setPdfLoading(null);
    }
  };

  let invoicesTableContent;
  if (loading) {
    invoicesTableContent = <div className="inv-loading">Loading invoices…</div>;
  } else if (invoices.length === 0) {
    invoicesTableContent = <div className="inv-empty">No invoices found.</div>;
  } else {
    invoicesTableContent = (
      <div className="inv-table-wrap">
        <table className="inv-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {invoices.map((inv, i) => {
                const badge = STATUS_BADGE[inv.status] || STATUS_BADGE.issued;
                return (
                  <motion.tr key={inv._id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  >
                    <td><code className="invc-number">{inv.invoiceNumber}</code></td>
                    <td>
                      <div className="invc-customer">
                        <span className="invc-customer-name">{inv.user?.name || "—"}</span>
                        <span className="invc-customer-email">{inv.user?.email || ""}</span>
                      </div>
                    </td>
                    <td>{new Date(inv.paidAt).toLocaleDateString()}</td>
                    <td><strong>Rs {Math.round(inv.total || 0).toLocaleString('en-US')}</strong></td>
                    <td>
                      <span className={`invc-status-badge ${badge.cls}`}>{badge.label}</span>
                    </td>
                    <td>
                      <div className="invc-actions">
                        <button
                          className="inv-action-btn inv-action-btn--history"
                          onClick={() => setDrawer({ open: true, invoice: inv })}
                        >
                          <FiEye size={12} /> View
                        </button>
                        <button
                          className="inv-action-btn inv-action-btn--restock"
                          onClick={() => handlePDF(inv)}
                          disabled={pdfLoading === inv._id}
                        >
                          <FiDownload size={12} />
                          {pdfLoading === inv._id ? "…" : "PDF"}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <motion.div
      className="admin-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Invoices</h1>
          <p className="admin-page-subtitle">All generated invoices from completed payments.</p>
        </div>
        <button className="inv-refresh-btn" onClick={fetchInvoices}>
          <FiRefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Stats strip */}
      <div className="invc-stats-strip">
        {[
          { icon: <FiFileText />,   label: "Total Invoices", value: stats.totalIssued || 0,                          cls: "invc-stat--default" },
          { icon: <FiDollarSign />, label: "Total Revenue",  value: `Rs ${Math.round(stats.totalRevenue  || 0).toLocaleString('en-US')}`, cls: "invc-stat--success" },
          { icon: <FiRotateCcw />,  label: "Total Refunded", value: `Rs ${Math.round(stats.totalRefunded || 0).toLocaleString('en-US')}`, cls: "invc-stat--danger"  },
        ].map((s, i) => (
          <motion.div key={s.label} className={`invc-stat ${s.cls}`}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
          >
            <div className="invc-stat-icon">{s.icon}</div>
            <div>
              <p className="invc-stat-value">{s.value}</p>
              <p className="invc-stat-label">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="admin-card invc-toolbar">
        <div className="invc-search-wrap">
          <FiSearch className="invc-search-icon" size={15} />
          <input
            className="invc-search"
            type="text"
            placeholder="Search by invoice number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTS.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="admin-card">
        {invoicesTableContent}
      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {drawer.open && drawer.invoice && (
          <>
            <motion.div className="inv-drawer-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDrawer(EMPTY_DRAWER)}
            />
            <motion.aside className="inv-drawer invc-drawer"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            >
              <div className="inv-drawer-header">
                <div>
                  <h3>Invoice Detail</h3>
                  <p>{drawer.invoice.invoiceNumber}</p>
                </div>
                <button className="inv-drawer-close" onClick={() => setDrawer(EMPTY_DRAWER)}>
                  <FiX size={18} />
                </button>
              </div>

              <div className="inv-drawer-body invc-drawer-body">
                <div className="invc-detail-section">
                  <h4>Customer</h4>
                  <p>{drawer.invoice.user?.name}</p>
                  <p className="invc-muted">{drawer.invoice.user?.email}</p>
                </div>

                {drawer.invoice.shippingAddress && (
                  <div className="invc-detail-section">
                    <h4>Ship To</h4>
                    <p>{drawer.invoice.shippingAddress.street}</p>
                    <p>{drawer.invoice.shippingAddress.city}, {drawer.invoice.shippingAddress.state} {drawer.invoice.shippingAddress.zipCode}</p>
                    <p>{drawer.invoice.shippingAddress.country}</p>
                  </div>
                )}

                <div className="invc-detail-section">
                  <h4>Line Items</h4>
                  <table className="invc-line-table">
                    <thead>
                      <tr><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr>
                    </thead>
                    <tbody>
                      {(drawer.invoice.lineItems || []).map((li, idx) => (
                        <tr key={li.name ? `${li.name}-${idx}` : idx}>
                          <td>{li.name}</td>
                          <td>{li.quantity}</td>
                          <td>Rs {Math.round(li.unitPrice || 0).toLocaleString('en-US')}</td>
                          <td>Rs {Math.round(li.total || 0).toLocaleString('en-US')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="invc-totals">
                  <div className="invc-total-row">
                    <span>Subtotal</span>
                    <span>Rs {Math.round(drawer.invoice.subtotal || 0).toLocaleString('en-US')}</span>
                  </div>
                  {drawer.invoice.discount > 0 && (
                    <div className="invc-total-row invc-total-row--discount">
                      <span>Discount</span>
                      <span>-Rs {Math.round(drawer.invoice.discount).toLocaleString('en-US')}</span>
                    </div>
                  )}
                  <div className="invc-total-row invc-total-row--grand">
                    <span>Total</span>
                    <span>Rs {Math.round(drawer.invoice.total || 0).toLocaleString('en-US')}</span>
                  </div>
                </div>

                <div className="invc-detail-section">
                  <h4>Payment</h4>
                  <p>Method: <strong>{drawer.invoice.paymentMethod || "N/A"}</strong></p>
                  <p className="invc-muted">TxID: {drawer.invoice.transactionId || "N/A"}</p>
                </div>

                <button
                  className="invc-pdf-btn"
                  onClick={() => handlePDF(drawer.invoice)}
                  disabled={pdfLoading === drawer.invoice._id}
                >
                  <FiDownload size={14} />
                  {pdfLoading === drawer.invoice._id ? "Generating…" : "Download PDF"}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
