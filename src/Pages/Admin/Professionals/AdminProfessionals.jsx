import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiEdit, FiTrash2, FiUserX, FiUserCheck } from "react-icons/fi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import DataTable from "../../../Components/Admin/DataTable/DataTable";
import adminProfessionalsApi from "../../../Services/api/adminProfessionalsApi";
import { useToast } from "../../../context/ToastContext";
import "./AdminProfessionals.css";

const ROLE_FILTERS = ["all", "veterinarian", "groomer", "trainer", "petTaxi"];
const STATUS_FILTERS = ["all", "active", "inactive"];
const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72'%3E%3Crect width='72' height='72' fill='%23f0ebe4'/%3E%3Ctext x='50%25' y='56%25' text-anchor='middle' font-size='30' fill='%23c9baa8'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E";

const columns = [
  {
    accessor: "name",
    header: "Name",
    render: (_v, row) => (
      <div className="apro-name-cell">
        <img
          className="apro-avatar"
          src={row.professionalInfo?.profileImage?.url || row.profileImage?.url || PLACEHOLDER}
          alt={row.name}
          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
        />
        <div>
          <div className="apro-name">{row.name}</div>
          <div className="apro-email">{row.email}</div>
        </div>
      </div>
    ),
  },
  { accessor: "role", header: "Role", render: (v) => <span className="apro-role-badge">{v}</span> },
  { accessor: "professionalInfo.specialization", header: "Specialization", render: (v) => v || "—" },
  { accessor: "professionalInfo.experience", header: "Exp.", render: (v) => `${v ?? 0} yr` },
  { accessor: "professionalInfo.rating", header: "Rating", render: (v) => `★ ${(v ?? 0).toFixed(1)}` },
  {
    accessor: "professionalInfo.isActive",
    header: "Status",
    render: (v) => (
      <span className={`apro-status ${v ? "is-active" : "is-inactive"}`}>{v ? "Active" : "Inactive"}</span>
    ),
  },
];

const AdminProfessionals = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      const params = { limit: 1000 };
      if (roleFilter !== "all") params.role = roleFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await adminProfessionalsApi.list(params);
      setRows(res.data || []);
    } catch {
      addToast("Failed to load professionals", "error");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, addToast]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const handleToggle = async (row) => {
    const next = !row.professionalInfo?.isActive;
    try {
      await adminProfessionalsApi.toggleStatus(row._id, next);
      setRows((prev) => prev.map((r) =>
        r._id === row._id ? { ...r, professionalInfo: { ...r.professionalInfo, isActive: next } } : r));
      addToast(next ? "Professional activated" : "Professional deactivated", "success");
    } catch {
      addToast("Failed to update status", "error");
    }
  };

  const handleOffboard = async (row) => {
    if (!window.confirm(`Offboard ${row.name}? They will be demoted to a customer.`)) return;
    try {
      await adminProfessionalsApi.offboard(row._id);
      setRows((prev) => prev.filter((r) => r._id !== row._id));
      addToast("Professional offboarded", "success");
    } catch {
      addToast("Failed to offboard", "error");
    }
  };

  return (
    <div className="apro-page">
      <div className="apro-header">
        <h1>Professionals</h1>
        <button className="apro-add-btn" onClick={() => navigate("/admin/professionals/new")}>
          <FiPlus /> Add professional
        </button>
      </div>

      <div className="apro-filters">
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="apro-filter"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            {ROLE_FILTERS.map((r) => <SelectItem key={r} value={r}>{r === "all" ? "All roles" : r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="apro-filter"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All statuses" : s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        loading={loading}
        customActions={(row) => (
          <>
            <button
              className="action-btn edit"
              title="Edit"
              onClick={() => navigate(`/admin/professionals/${row._id}/edit`, { state: { professional: row } })}
            >
              <FiEdit />
            </button>
            <button
              className="action-btn"
              title={row.professionalInfo?.isActive ? "Deactivate" : "Activate"}
              onClick={() => handleToggle(row)}
            >
              {row.professionalInfo?.isActive ? <FiUserX /> : <FiUserCheck />}
            </button>
            <button className="action-btn delete" title="Offboard" onClick={() => handleOffboard(row)}>
              <FiTrash2 />
            </button>
          </>
        )}
      />
    </div>
  );
};

export default AdminProfessionals;
