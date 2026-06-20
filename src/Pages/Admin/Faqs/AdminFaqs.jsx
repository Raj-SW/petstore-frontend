import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiHelpCircle, FiPlus } from "react-icons/fi";
import DataTable from "../../../Components/Admin/DataTable/DataTable";
import faqsApi from "../../../Services/api/faqsApi";
import { useToast } from "../../../context/ToastContext";
import "../Tips/AdminTips.css";
import "./AdminFaqs.css";

const EMPTY = { question: "", answer: "", order: 0, active: true };

const AdminFaqs = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { addToast } = useToast();

  useEffect(() => { fetchFaqs(); }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await faqsApi.getFaqsAdmin();
      setItems(res.data || []);
    } catch {
      addToast("Failed to load FAQs", "error");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm(EMPTY); setFormOpen(true); };
  const openEdit = (faq) => {
    setEditing(faq);
    setForm({ question: faq.question, answer: faq.answer, order: faq.order ?? 0, active: faq.active });
    setFormOpen(true);
  };

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  const save = async () => {
    if (form.question.trim().length < 2 || form.answer.trim().length < 2) {
      addToast("Question and answer are required", "error");
      return;
    }
    try {
      setSaving(true);
      const payload = { ...form, order: Number(form.order) || 0 };
      if (editing) await faqsApi.updateFaq(editing._id, payload);
      else await faqsApi.createFaq(payload);
      addToast(editing ? "FAQ updated" : "FAQ created", "success");
      setFormOpen(false);
      fetchFaqs();
    } catch (err) {
      addToast(err.response?.data?.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (faq) => {
    try {
      await faqsApi.updateFaq(faq._id, { active: !faq.active });
      fetchFaqs();
    } catch {
      addToast("Failed to update", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await faqsApi.deleteFaq(deleteTarget._id);
      addToast("FAQ deleted", "success");
      setDeleteTarget(null);
      fetchFaqs();
    } catch {
      addToast("Failed to delete", "error");
    }
  };

  const columns = [
    { header: "Order", accessor: "order", render: (v) => <span className="at-pill">{v ?? 0}</span> },
    { header: "Question", accessor: "question", render: (v) => <span className="at-title">{v}</span> },
    {
      header: "Answer",
      accessor: "answer",
      sortable: false,
      render: (v) => <span className="af-message-snippet">{v?.length > 70 ? `${v.slice(0, 70)}…` : v}</span>,
    },
    {
      header: "Active",
      accessor: "active",
      sortable: false,
      render: (v, item) => (
        <button
          className={`at-status ${v ? "published" : "draft"}`}
          onClick={(e) => { e.stopPropagation(); toggleActive(item); }}
          title={v ? "Click to hide" : "Click to show"}
        >
          {v ? "Active" : "Hidden"}
        </button>
      ),
    },
  ];

  return (
    <motion.div className="admin-page" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">FAQs</h1>
          <p className="admin-page-subtitle">Manage the questions shown in the homepage FAQ section.</p>
        </div>
        <button className="at-btn-primary" onClick={openCreate}>
          <FiPlus /> New FAQ
        </button>
      </div>

      <DataTable data={items} columns={columns} loading={loading} onEdit={openEdit} onDelete={(f) => setDeleteTarget(f)} />

      {/* Create / edit modal */}
      <AnimatePresence>
        {formOpen && (
          <motion.div className="admin-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFormOpen(false)}>
            <motion.div className="admin-modal" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <h3><FiHelpCircle /> {editing ? "Edit FAQ" : "New FAQ"}</h3>
              <label className="af-field-label">Question</label>
              <input className="es-input" value={form.question} onChange={set("question")} placeholder="e.g. Do you deliver island-wide?" />
              <label className="af-field-label">Answer</label>
              <textarea className="es-input es-textarea" style={{ minHeight: 110 }} value={form.answer} onChange={set("answer")} placeholder="The answer customers will see…" />
              <div style={{ display: "flex", gap: "16px", alignItems: "center", marginTop: 8 }}>
                <label className="af-field-label" style={{ margin: 0 }}>
                  Order
                  <input type="number" className="es-input" style={{ width: 90, marginLeft: 8 }} value={form.order} onChange={set("order")} />
                </label>
                <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input type="checkbox" checked={form.active} onChange={set("active")} /> Active
                </label>
              </div>
              <div className="admin-modal-actions">
                <button className="at-btn-secondary" onClick={() => setFormOpen(false)}>Cancel</button>
                <button className="at-btn-primary" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save"}</button>
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
              <h3>Delete FAQ?</h3>
              <p>&ldquo;{deleteTarget.question}&rdquo; will be permanently removed.</p>
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

export default AdminFaqs;
