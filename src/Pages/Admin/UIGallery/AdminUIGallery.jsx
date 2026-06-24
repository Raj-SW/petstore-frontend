import { useState } from "react";
import { motion } from "framer-motion";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/Components/ui/select";

const Section = ({ title, children }) => (
  <div style={{ marginBottom: "2rem" }}>
    <h3 style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem", borderBottom: "1px solid #eee", paddingBottom: "0.5rem" }}>
      {title}
    </h3>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "flex-start" }}>
      {children}
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", minWidth: "200px" }}>
    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", fontWeight: 600, color: "#666" }}>{label}</span>
    {children}
  </div>
);

const AdminUIGallery = () => {
  // Basic string select
  const [status, setStatus] = useState("all");
  // Sentinel pattern (filter)
  const [filter, setFilter] = useState("all");
  // Number coercion
  const [perPage, setPerPage] = useState(10);
  // Boolean coercion
  const [taxMode, setTaxMode] = useState(false);
  // Placeholder (optional / nullable)
  const [reason, setReason] = useState("");
  // Disabled
  const [disabled] = useState("pending");

  return (
    <motion.div
      className="admin-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">UI Gallery — Select</h1>
          <p className="admin-page-subtitle">All shadcn Select patterns used across Epic 2</p>
        </div>
      </div>

      <div className="admin-card" style={{ padding: "2rem" }}>

        <Section title="Basic string select">
          <Field label={`Status: ${status}`}>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-auto"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map(s => (
                  <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </Section>

        <Section title="Sentinel pattern (filter — 'all' → undefined for API)">
          <Field label={`filter state: "${filter}"`}>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-auto"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="API arg">
            <code style={{ background: "#f4f4f4", padding: "0.4rem 0.7rem", borderRadius: 6, fontSize: "0.85rem" }}>
              {filter === "all" ? "undefined" : `"${filter}"`}
            </code>
          </Field>
        </Section>

        <Section title="Number coercion (items per page)">
          <Field label={`perPage: ${perPage} (${typeof perPage})`}>
            <Select value={String(perPage)} onValueChange={v => setPerPage(Number(v))}>
              <SelectTrigger className="h-8 w-auto text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[5, 10, 25, 50].map(n => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </Section>

        <Section title="Boolean coercion (inclusive / exclusive)">
          <Field label={`taxInclusive: ${taxMode} (${typeof taxMode})`}>
            <Select value={taxMode ? "inclusive" : "exclusive"} onValueChange={v => setTaxMode(v === "inclusive")}>
              <SelectTrigger className="w-auto"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="inclusive">Tax Inclusive</SelectItem>
                <SelectItem value="exclusive">Tax Exclusive</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </Section>

        <Section title="Placeholder pattern (nullable / optional)">
          <Field label={`reason: "${reason}" (${reason ? "set" : "empty → shows placeholder"})`}>
            <Select value={reason || undefined} onValueChange={setReason}>
              <SelectTrigger className="w-full" style={{ minWidth: 220 }}>
                <SelectValue placeholder="Select a reason…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="damaged">Item arrived damaged</SelectItem>
                <SelectItem value="wrong">Wrong item received</SelectItem>
                <SelectItem value="missing">Item never arrived</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {reason && (
            <Field label="">
              <button
                type="button"
                onClick={() => setReason("")}
                style={{ padding: "0.3rem 0.8rem", borderRadius: 6, border: "1px solid #ddd", cursor: "pointer", fontSize: "0.82rem" }}
              >
                Clear (reset to placeholder)
              </button>
            </Field>
          )}
        </Section>

        <Section title="Disabled state">
          <Field label="Status (disabled)">
            <Select value={disabled} disabled>
              <SelectTrigger className="w-auto"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </Section>

      </div>
    </motion.div>
  );
};

export default AdminUIGallery;
