import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiInbox, FiCheckCircle, FiCornerUpLeft } from "react-icons/fi";
import DataTable from "../../../Components/Admin/DataTable/DataTable";
import contactApi from "../../../Services/api/contactApi";
import { useToast } from "../../../context/ToastContext";
import "../Tips/AdminTips.css";
import "./AdminContacts.css";

const STATUS_CYCLE = { new: "read", read: "replied", replied: "new" };

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const { addToast } = useToast();

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await contactApi.getContactsAdmin({ limit: 100 });
      setContacts(res.data || []);
    } catch {
      addToast("Failed to fetch messages", "error");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => ({
    total: contacts.length,
    unread: contacts.filter((c) => c.status === "new").length,
    replied: contacts.filter((c) => c.status === "replied").length,
  }), [contacts]);

  const cycleStatus = async (contact) => {
    const next = STATUS_CYCLE[contact.status] || "read";
    try {
      await contactApi.updateContact(contact._id, { status: next });
      fetchContacts();
    } catch {
      addToast("Failed to update status", "error");
    }
  };

  const sendReply = async () => {
    if (!viewing || !replyText.trim()) return;
    try {
      setSendingReply(true);
      await contactApi.replyContact(viewing._id, replyText.trim());
      addToast("Reply sent", "success");
      setReplyText("");
      setViewing(null);
      fetchContacts();
    } catch {
      addToast("Failed to send reply", "error");
    } finally {
      setSendingReply(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await contactApi.deleteContact(deleteTarget._id);
      addToast("Message deleted", "success");
      setDeleteTarget(null);
      fetchContacts();
    } catch {
      addToast("Failed to delete message", "error");
    }
  };

  const columns = [
    { header: "Name", accessor: "name", render: (v) => <span className="at-title">{v}</span> },
    { header: "Email", accessor: "email" },
    {
      header: "Message",
      accessor: "message",
      sortable: false,
      render: (v) => <span className="ac-snippet">{v?.length > 60 ? `${v.slice(0, 60)}…` : v}</span>,
    },
    {
      header: "Status",
      accessor: "status",
      render: (v, item) => (
        <button
          className={`ac-status ac-status-${v}`}
          onClick={(e) => { e.stopPropagation(); cycleStatus(item); }}
          title="Click to change status"
        >
          {v}
        </button>
      ),
    },
    { header: "Received", accessor: "createdAt", render: (v) => (v ? new Date(v).toLocaleDateString() : "—") },
  ];

  return (
    <motion.div className="admin-page" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Contact Messages</h1>
          <p className="admin-page-subtitle">Questions and messages from the contact + homepage forms</p>
        </div>
      </div>

      {!loading && (
        <div className="at-stats">
          <div className="at-stat-card"><FiInbox size={18} /><div><p className="at-stat-value">{stats.total}</p><p className="at-stat-label">Total</p></div></div>
          <div className="at-stat-card"><FiMail size={18} /><div><p className="at-stat-value">{stats.unread}</p><p className="at-stat-label">Unread</p></div></div>
          <div className="at-stat-card"><FiCheckCircle size={18} /><div><p className="at-stat-value">{stats.replied}</p><p className="at-stat-label">Replied</p></div></div>
        </div>
      )}

      <DataTable
        data={contacts}
        columns={columns}
        loading={loading}
        onView={(c) => setViewing(c)}
        onDelete={(c) => setDeleteTarget(c)}
      />

      {/* View modal */}
      <AnimatePresence>
        {viewing && (
          <motion.div className="admin-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setViewing(null); setReplyText(""); }}>
            <motion.div className="admin-modal ac-view" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <h3>{viewing.name}</h3>
              <p className="ac-view-email">{viewing.email}</p>
              <p className="ac-view-message">{viewing.message}</p>
              {viewing.lastReply && (
                <p className="ac-view-message" style={{ background: "#f0f8f3", borderRadius: 8, padding: "10px 12px" }}>
                  <strong>Last reply:</strong> {viewing.lastReply}
                </p>
              )}
              <textarea
                className="es-input es-textarea"
                style={{ width: "100%", minHeight: 90, marginTop: 8 }}
                placeholder={`Reply to ${viewing.name}…`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="admin-modal-actions">
                <button className="at-btn-secondary" onClick={() => { cycleStatus(viewing); setViewing(null); }}>
                  Mark {STATUS_CYCLE[viewing.status] || "read"}
                </button>
                <button className="aa-submit" disabled={sendingReply || !replyText.trim()} onClick={sendReply}>
                  <FiCornerUpLeft size={13} /> {sendingReply ? "Sending…" : "Send reply"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div className="admin-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteTarget(null)}>
            <motion.div className="admin-modal" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <h3>Delete message?</h3>
              <p>The message from &ldquo;{deleteTarget.name}&rdquo; will be permanently removed.</p>
              <div className="admin-modal-actions">
                <button className="at-btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className="at-btn-danger" onClick={confirmDelete}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminContacts;
