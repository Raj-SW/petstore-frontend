import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiX } from "react-icons/fi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import ImageManager from "@/Components/Admin/ImageManager/ImageManager";
import { RichTextEditor } from "@/Components/RichText";
import adminProfessionalsApi from "@/Services/api/adminProfessionalsApi";
import { useToast } from "@/context/ToastContext";
import "./AdminProfessionalForm.css";

const ROLES = ["veterinarian", "groomer", "trainer", "petTaxi"];
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const emptyAvailability = () =>
  DAYS.reduce((acc, d) => ({ ...acc, [d]: { startTime: "09:00", endTime: "17:00", isAvailable: false } }), {});

const AdminProfessionalForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const isEdit = Boolean(id);

  const [mode, setMode] = useState("create"); // 'create' | 'promote'
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [account, setAccount] = useState({ name: "", email: "", phoneNumber: "", address: "" });
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [role, setRole] = useState("veterinarian");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState([]);
  const [services, setServices] = useState([]);
  const [availability, setAvailability] = useState(emptyAvailability());
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (!isEdit) return;
    const hydrate = (p) => {
      setRole(p.role || "veterinarian");
      const info = p.professionalInfo || {};
      setSpecialization(info.specialization || "");
      setExperience(info.experience ?? "");
      setQualifications((info.qualifications || []).join(", "));
      setBio(info.bio || "");
      setPhoto(info.profileImage?.url ? [info.profileImage] : (p.profileImage?.url ? [p.profileImage] : []));
      setServices(info.services || []);
      setAvailability({ ...emptyAvailability(), ...(info.availability || {}) });
      setRating(info.rating || 0);
      setAccount({ name: p.name || "", email: p.email || "", phoneNumber: p.phoneNumber || "", address: p.address || "" });
    };
    if (location.state?.professional) {
      hydrate(location.state.professional);
    } else {
      adminProfessionalsApi.list({ limit: 1000 }).then((res) => {
        const found = (res.data || []).find((r) => r._id === id);
        if (found) hydrate(found);
      });
    }
  }, [isEdit, id, location.state]);

  const runUserSearch = async () => {
    if (!userQuery.trim()) return;
    const res = await adminProfessionalsApi.searchUsers(userQuery.trim());
    setUserResults(res.data || []);
  };

  const buildProfessionalInfo = () => ({
    specialization: specialization.trim(),
    experience: Number(experience),
    qualifications: qualifications.split(",").map((q) => q.trim()).filter(Boolean),
    bio: bio.trim(),
    services,
    availability,
    ...(photo[0] ? { profileImage: photo[0] } : {}),
  });

  const validate = () => {
    const e = {};
    if (!specialization.trim()) e.specialization = "Required";
    if (experience === "" || Number.isNaN(Number(experience))) e.experience = "Required";
    if (!isEdit && mode === "create") {
      if (!account.name.trim()) e.name = "Required";
      if (!account.email.trim()) e.email = "Required";
      if (!account.phoneNumber.trim()) e.phoneNumber = "Required";
      if (!account.address.trim()) e.address = "Required";
    }
    if (!isEdit && mode === "promote" && !selectedUser) e.user = "Pick a user";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const professionalInfo = buildProfessionalInfo();
      if (isEdit) {
        await adminProfessionalsApi.update(id, professionalInfo);
        addToast("Professional updated", "success");
      } else if (mode === "promote") {
        await adminProfessionalsApi.promote({ userId: selectedUser._id, role, professionalInfo });
        addToast("User promoted to professional", "success");
      } else {
        await adminProfessionalsApi.create({ ...account, role, professionalInfo });
        addToast("Professional created — invite sent", "success");
      }
      navigate("/admin/professionals");
    } catch (err) {
      addToast(err?.response?.data?.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const setDay = (day, patch) =>
    setAvailability((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));

  const addService = () => setServices((s) => [...s, { name: "", price: 0, duration: 30, description: "" }]);
  const setService = (i, patch) => setServices((s) => s.map((sv, j) => (j === i ? { ...sv, ...patch } : sv)));
  const removeService = (i) => setServices((s) => s.filter((_, j) => j !== i));

  return (
    <div className="apf-page">
      <Link to="/admin/professionals" className="apf-back">
        <FiArrowLeft /> Back to professionals
      </Link>

      <h1 className="apf-title">{isEdit ? "Edit professional" : "Add professional"}</h1>

      <form className="apf-form" onSubmit={handleSubmit}>
        {!isEdit && (
          <div className="apf-tabs">
            <button
              type="button"
              className={`apf-tab ${mode === "create" ? "apf-tab--active" : ""}`}
              onClick={() => setMode("create")}
              aria-pressed={mode === "create"}
            >
              New account
            </button>
            <button
              type="button"
              className={`apf-tab ${mode === "promote" ? "apf-tab--active" : ""}`}
              onClick={() => setMode("promote")}
              aria-pressed={mode === "promote"}
            >
              Promote existing
            </button>
          </div>
        )}

        {!isEdit && mode === "promote" && (
          <div className="apf-section">
            <div className="apf-field">
              <label htmlFor="apf-user-q">Find user</label>
              <div className="apf-search-row">
                <input
                  id="apf-user-q"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Search by name or email"
                />
                <button type="button" className="apf-btn-secondary" onClick={runUserSearch}>
                  Search
                </button>
              </div>
              {errors.user && <p className="apf-error">{errors.user}</p>}
            </div>
            {userResults.length > 0 && (
              <ul className="apf-user-results">
                {userResults.map((u) => (
                  <li key={u._id}>
                    <button
                      type="button"
                      className={`apf-user-result ${selectedUser?._id === u._id ? "apf-user-result--selected" : ""}`}
                      aria-pressed={selectedUser?._id === u._id}
                      onClick={() => setSelectedUser(u)}
                    >
                      <span className="apf-user-name">{u.name}</span>
                      <span className="apf-user-email">{u.email}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {!isEdit && mode === "create" && (
          <div className="apf-section">
            <div className="apf-row">
              <div className="apf-field">
                <label htmlFor="f-name">Name</label>
                <input id="f-name" value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })} />
                {errors.name && <p className="apf-error">{errors.name}</p>}
              </div>
              <div className="apf-field">
                <label htmlFor="f-email">Email</label>
                <input id="f-email" type="email" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} />
                {errors.email && <p className="apf-error">{errors.email}</p>}
              </div>
            </div>
            <div className="apf-row">
              <div className="apf-field">
                <label htmlFor="f-phone">Phone</label>
                <input id="f-phone" value={account.phoneNumber} onChange={(e) => setAccount({ ...account, phoneNumber: e.target.value })} />
                {errors.phoneNumber && <p className="apf-error">{errors.phoneNumber}</p>}
              </div>
              <div className="apf-field">
                <label htmlFor="f-address">Address</label>
                <input id="f-address" value={account.address} onChange={(e) => setAccount({ ...account, address: e.target.value })} />
                {errors.address && <p className="apf-error">{errors.address}</p>}
              </div>
            </div>
          </div>
        )}

        <div className="apf-section">
          <div className="apf-row">
            <div className="apf-field">
              <label>Role</label>
              <Select value={role} onValueChange={setRole} disabled={isEdit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="apf-field">
              <label htmlFor="f-exp">Experience (years)</label>
              <input id="f-exp" type="number" min="0" value={experience} onChange={(e) => setExperience(e.target.value)} />
              {errors.experience && <p className="apf-error">{errors.experience}</p>}
            </div>
          </div>

          <div className="apf-field">
            <label htmlFor="f-spec">Specialization</label>
            <input id="f-spec" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
            {errors.specialization && <p className="apf-error">{errors.specialization}</p>}
          </div>

          <div className="apf-field">
            <label htmlFor="f-qual">Qualifications (comma-separated)</label>
            <input id="f-qual" value={qualifications} onChange={(e) => setQualifications(e.target.value)} />
          </div>

          <RichTextEditor
            label="Bio"
            value={bio}
            onChange={setBio}
            preset="minimal"
            placeholder="A short bio for your public profile…"
            maxLength={5000}
            minHeight="140px"
          />

          {isEdit && (
            <p className="apf-readonly">★ {rating.toFixed(1)} rating <span>(read-only, from customer reviews)</span></p>
          )}
        </div>

        <div className="apf-section">
          <label className="apf-section-label">Profile photo</label>
          <ImageManager value={photo} onChange={setPhoto} uploadUrl="/admin/professionals/upload-image" max={1} label="Photo" />
        </div>

        <div className="apf-section">
          <div className="apf-section-head">
            <label className="apf-section-label">Services</label>
            <button type="button" className="apf-btn-add" onClick={addService}>
              <FiPlus /> Add service
            </button>
          </div>
          {services.map((sv, i) => (
            <div key={i} className="apf-service-row">
              <input aria-label={`service-name-${i}`} className="apf-service-name" placeholder="Name" value={sv.name} onChange={(e) => setService(i, { name: e.target.value })} />
              <input aria-label={`service-price-${i}`} className="apf-service-num" type="number" min="0" placeholder="Rs" value={sv.price} onChange={(e) => setService(i, { price: Number(e.target.value) })} />
              <input aria-label={`service-duration-${i}`} className="apf-service-num" type="number" min="15" placeholder="min" value={sv.duration} onChange={(e) => setService(i, { duration: Number(e.target.value) })} />
              <button type="button" className="apf-icon-btn" onClick={() => removeService(i)} aria-label={`remove-service-${i}`}>
                <FiX />
              </button>
            </div>
          ))}
        </div>

        <div className="apf-section">
          <label className="apf-section-label">Weekly availability</label>
          <div className="apf-availability">
            {DAYS.map((day) => (
              <div key={day} className="apf-avail-row">
                <label className="apf-avail-day">
                  <input type="checkbox" checked={availability[day].isAvailable} onChange={(e) => setDay(day, { isAvailable: e.target.checked })} />
                  {day}
                </label>
                <input
                  type="time"
                  className="apf-avail-time"
                  aria-label={`${day}-start`}
                  value={availability[day].startTime}
                  onChange={(e) => setDay(day, { startTime: e.target.value })}
                  disabled={!availability[day].isAvailable}
                />
                <span className="apf-avail-sep">to</span>
                <input
                  type="time"
                  className="apf-avail-time"
                  aria-label={`${day}-end`}
                  value={availability[day].endTime}
                  onChange={(e) => setDay(day, { endTime: e.target.value })}
                  disabled={!availability[day].isAvailable}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="apf-actions">
          <button type="submit" className="apf-submit" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create"}
          </button>
          <button type="button" className="apf-btn-secondary" onClick={() => navigate("/admin/professionals")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProfessionalForm;
