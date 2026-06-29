import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { FiSend, FiTag, FiUsers } from "react-icons/fi";
import DataTable from "../../../Components/Admin/DataTable/DataTable";
import announcementsApi from "../../../Services/api/announcementsApi";
import productsApi from "../../../Services/api/productsApi";
import tipsApi from "../../../Services/api/tipsApi";
import galleryApi from "../../../Services/api/galleryApi";
import { useToast } from "../../../context/ToastContext";
import { useCurrency } from "../../../context/CurrencyContext";
import "../Tips/AdminTips.css";
import "./AdminAnnouncements.css";

const TYPE_OPTIONS = [
  { value: "sale", label: "Sale", group: "product" },
  { value: "new_product", label: "New product", group: "product" },
  { value: "price_drop", label: "Price drop", group: "product" },
  { value: "restock", label: "Back in stock", group: "product" },
  { value: "new_tip", label: "New care tip", group: "content", kind: "tip" },
  { value: "new_post", label: "New gallery post", group: "content", kind: "post" },
  { value: "event", label: "Event", group: "event" },
  { value: "general", label: "General news", group: "general" },
];

const groupOf = (type) => TYPE_OPTIONS.find((t) => t.value === type)?.group || "product";

const AdminAnnouncements = () => {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState("sale");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [contentItems, setContentItems] = useState([]);
  const [contentId, setContentId] = useState("");
  const [event, setEvent] = useState({ title: "", startsAt: "", endsAt: "", location: "", description: "" });
  const [cta, setCta] = useState({ label: "", url: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const { addToast } = useToast();
  const { formatPrice } = useCurrency();

  const group = groupOf(type);

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
      setProducts(list);
      setHistory(histRes.data || []);
    } catch {
      addToast("Failed to load products or history", "error");
    } finally {
      setLoading(false);
    }
  };

  // Lazily load tips/posts when a content type is selected.
  useEffect(() => {
    const opt = TYPE_OPTIONS.find((t) => t.value === type);
    if (group !== "content") return;
    setContentId("");
    const load = opt.kind === "tip" ? tipsApi.getTips({ limit: 200 }) : galleryApi.getPosts({ limit: 200 });
    load
      .then((res) => {
        const items = res?.data || res?.posts || res?.tips || (Array.isArray(res) ? res : []);
        setContentItems(items);
      })
      .catch(() => addToast("Failed to load content list", "error"));
  }, [type, group, addToast]);

  // For the 'sale' type default the picker to on-sale products; otherwise all.
  const displayedProducts = useMemo(
    () => (type === "sale" ? products.filter((p) => p.onSale) : products),
    [products, type]
  );

  const toggleProduct = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const targetReady = (() => {
    if (group === "product") return selectedIds.length > 0;
    if (group === "content") return Boolean(contentId);
    if (group === "event") return event.title.trim() && event.startsAt;
    if (group === "general") return message.trim() || cta.url.trim();
    return false;
  })();

  const canSend = subject.trim().length >= 2 && targetReady && !sending;

  const selectedProducts = useMemo(
    () => products.filter((p) => selectedIds.includes(p._id)),
    [products, selectedIds]
  );

  const buildPayload = () => {
    const base = { type, subject: subject.trim(), message: message.trim(), source: "composer" };
    if (group === "product") return { ...base, productIds: selectedIds };
    if (group === "content") {
      const kind = TYPE_OPTIONS.find((t) => t.value === type).kind;
      return { ...base, contentRef: { kind, id: contentId } };
    }
    if (group === "event") {
      const ev = { title: event.title.trim(), startsAt: event.startsAt };
      if (event.endsAt) ev.endsAt = event.endsAt;
      if (event.location.trim()) ev.location = event.location.trim();
      if (event.description.trim()) ev.description = event.description.trim();
      const payload = { ...base, event: ev };
      if (cta.url.trim()) payload.cta = { label: cta.label.trim() || "Learn more", url: cta.url.trim() };
      return payload;
    }
    // general
    const payload = { ...base };
    if (cta.url.trim()) payload.cta = { label: cta.label.trim() || "Learn more", url: cta.url.trim() };
    return payload;
  };

  const doSend = async () => {
    try {
      setSending(true);
      const res = await announcementsApi.createAnnouncement(buildPayload());
      addToast(res.message || "Announcement sent", "success");
      setSubject(""); setMessage(""); setSelectedIds([]); setContentId("");
      setEvent({ title: "", startsAt: "", endsAt: "", location: "", description: "" });
      setCta({ label: "", url: "" });
      setConfirmOpen(false);
      fetchAll();
    } catch (err) {
      addToast(err.response?.data?.message || err.message || "Failed to send announcement", "error");
    } finally {
      setSending(false);
    }
  };

  const columns = [
    { header: "Subject", accessor: "subject" },
    { header: "Type", accessor: "type", render: (v) => <span className="at-pill">{v || "sale"}</span> },
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
          <h1 className="admin-page-title">Announcements</h1>
          <p className="admin-page-subtitle">
            Email customers about sales, new products, events, tips and news.
          </p>
        </div>
      </div>

      <div className="aa-composer">
        <div className="aa-field">
          <label className="admin-label" htmlFor="aa-type">Announcement type</label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <input
          className="aa-input"
          placeholder="Email subject (e.g. Weekend Dog Food Sale)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea
          className="aa-textarea"
          placeholder="Optional message shown at the top…"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {/* Product target */}
        {group === "product" && (
          <>
            <p className="aa-section-label">
              <FiTag /> {type === "sale" ? "On-sale products" : "Products"}
              {displayedProducts.length === 0 && !loading && " — none available"}
            </p>
            <div className="aa-product-grid">
              {displayedProducts.map((p) => {
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
          </>
        )}

        {/* Content target */}
        {group === "content" && (
          <div className="aa-field">
            <label className="admin-label" htmlFor="aa-content">Select {type === "new_tip" ? "a care tip" : "a gallery post"}</label>
            <Select value={contentId || undefined} onValueChange={setContentId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="— choose —" />
              </SelectTrigger>
              <SelectContent>
                {contentItems.map((c) => (
                  <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Event fields */}
        {group === "event" && (
          <div className="aa-event-grid">
            <input className="aa-input" placeholder="Event title" value={event.title} onChange={(e) => setEvent((v) => ({ ...v, title: e.target.value }))} />
            <input className="aa-input" type="datetime-local" aria-label="event start" value={event.startsAt} onChange={(e) => setEvent((v) => ({ ...v, startsAt: e.target.value }))} />
            <input className="aa-input" type="datetime-local" aria-label="event end" value={event.endsAt} onChange={(e) => setEvent((v) => ({ ...v, endsAt: e.target.value }))} />
            <input className="aa-input" placeholder="Location (optional)" value={event.location} onChange={(e) => setEvent((v) => ({ ...v, location: e.target.value }))} />
            <textarea className="aa-textarea" placeholder="Event description (optional)" rows={2} value={event.description} onChange={(e) => setEvent((v) => ({ ...v, description: e.target.value }))} />
          </div>
        )}

        {/* Optional CTA for event + general */}
        {(group === "event" || group === "general") && (
          <div className="aa-cta-grid">
            <input className="aa-input" placeholder="Button label (optional)" value={cta.label} onChange={(e) => setCta((v) => ({ ...v, label: e.target.value }))} />
            <input className="aa-input" placeholder="Button URL (optional)" value={cta.url} onChange={(e) => setCta((v) => ({ ...v, url: e.target.value }))} />
          </div>
        )}

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
                <FiUsers /> Send this announcement?
              </h3>
              <p>
                {(() => {
                  const productSuffix = selectedProducts.length === 1 ? "" : "s";
                  const productClause = group === "product" ? ` featuring ${selectedProducts.length} product${productSuffix}` : "";
                  return `“${subject}”${productClause} will be emailed to every customer subscribed to this kind of update.`;
                })()}
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
