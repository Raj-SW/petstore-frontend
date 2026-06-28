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
  FiTrendingUp, FiTrendingDown, FiActivity, FiRefreshCw,
} from "react-icons/fi";
import transactionApi from "../../../Services/api/transactionApi";
import { useToast } from "../../../context/ToastContext";
import "./AdminTransactions.css";

const TYPE_OPTS = [
  { value: "all",     label: "All Types" },
  { value: "payment", label: "Payments" },
  { value: "refund",  label: "Refunds" },
];

const METHOD_OPTS = [
  { value: "all",         label: "All Methods" },
  { value: "stripe",      label: "Stripe" },
  { value: "paypal",      label: "PayPal" },
  { value: "credit_card", label: "Credit Card" },
];

const TYPE_BADGE = {
  payment: { cls: "txn-badge--payment", label: "Payment" },
  refund:  { cls: "txn-badge--refund",  label: "Refund"  },
};

export default function AdminTransactions() {
  const { addToast } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [stats,   setStats]   = useState({ totalRevenue: 0, totalRefunds: 0, netRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [type,    setType]    = useState("all");
  const [method,  setMethod]  = useState("all");

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await transactionApi.getTransactions({
        type:          type === "all"   ? undefined : type,
        paymentMethod: method === "all" ? undefined : method,
        limit: 100,
      });
      setTransactions(res.data  || []);
      if (res.stats) setStats(res.stats);
    } catch {
      addToast("Failed to load transactions", "error");
    } finally {
      setLoading(false);
    }
  }, [type, method]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  return (
    <motion.div
      className="admin-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Transactions</h1>
          <p className="admin-page-subtitle">Financial ledger of all payments and refunds.</p>
        </div>
        <button className="inv-refresh-btn" onClick={fetchTransactions}>
          <FiRefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Stats strip */}
      <div className="txn-stats-strip">
        {[
          { icon: <FiTrendingUp />,  label: "Total Revenue", value: `Rs ${Math.round(stats.totalRevenue || 0).toLocaleString('en-US')}`, cls: "txn-stat--success" },
          { icon: <FiTrendingDown />,label: "Total Refunds", value: `Rs ${Math.round(stats.totalRefunds || 0).toLocaleString('en-US')}`, cls: "txn-stat--danger"  },
          { icon: <FiActivity />,    label: "Net Revenue",   value: `Rs ${Math.round(stats.netRevenue   || 0).toLocaleString('en-US')}`, cls: "txn-stat--default" },
        ].map((s, i) => (
          <motion.div key={s.label} className={`txn-stat ${s.cls}`}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
          >
            <div className="txn-stat-icon">{s.icon}</div>
            <div>
              <p className="txn-stat-value">{s.value}</p>
              <p className="txn-stat-label">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="admin-card invc-toolbar">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTS.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {METHOD_OPTS.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="admin-card">
        {loading ? (
          <div className="inv-loading">Loading transactions…</div>
        ) : transactions.length === 0 ? (
          <div className="inv-empty">No transactions found.</div>
        ) : (
          <div className="inv-table-wrap">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Invoice</th>
                  <th>Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {transactions.map((tx, i) => {
                    const badge = TYPE_BADGE[tx.type] || TYPE_BADGE.payment;
                    return (
                      <motion.tr key={tx._id}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: Math.min(i * 0.02, 0.3) }}
                      >
                        <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="invc-customer">
                            <span className="invc-customer-name">{tx.user?.name || "—"}</span>
                            <span className="invc-customer-email">{tx.user?.email || ""}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`txn-badge ${badge.cls}`}>{badge.label}</span>
                        </td>
                        <td>
                          <span className={tx.type === "refund" ? "txn-amount--refund" : "txn-amount--payment"}>
                            {tx.type === "refund" ? "-" : "+"}Rs {Math.round(tx.amount || 0).toLocaleString('en-US')}
                          </span>
                        </td>
                        <td>{tx.paymentMethod?.replace("_", " ") || "—"}</td>
                        <td>
                          {tx.invoice
                            ? <code className="invc-number">{tx.invoice.invoiceNumber}</code>
                            : <span className="txn-na">—</span>}
                        </td>
                        <td>
                          <span className="txn-txid">{tx.transactionId || "—"}</span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
