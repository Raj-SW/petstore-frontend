import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import ImageManager from "@/Components/Admin/ImageManager/ImageManager";
import adminProfessionalsApi from "@/Services/api/adminProfessionalsApi";
import { useToast } from "@/context/ToastContext";

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
    <form className="apro-form" onSubmit={handleSubmit} style={{ padding: "1.5rem", maxWidth: 760 }}>
      <h1>{isEdit ? "Edit professional" : "Add professional"}</h1>

      {!isEdit && (
        <div className="apro-mode-tabs" style={{ display: "flex", gap: 8, margin: "1rem 0" }}>
          <button type="button" onClick={() => setMode("create")} aria-pressed={mode === "create"}>New account</button>
          <button type="button" onClick={() => setMode("promote")} aria-pressed={mode === "promote"}>Promote existing</button>
        </div>
      )}

      {!isEdit && mode === "promote" && (
        <div className="apro-user-search">
          <label htmlFor="apro-user-q">Find user</label>
          <input id="apro-user-q" value={userQuery} onChange={(e) => setUserQuery(e.target.value)} placeholder="name or email" />
          <button type="button" onClick={runUserSearch}>Search</button>
          {errors.user && <span className="apro-err">{errors.user}</span>}
          <ul>
            {userResults.map((u) => (
              <li key={u._id}>
                <button type="button" aria-pressed={selectedUser?._id === u._id} onClick={() => setSelectedUser(u)}>
                  {u.name} — {u.email}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isEdit && mode === "create" && (
        <fieldset style={{ border: "none", padding: 0 }}>
          <div><label htmlFor="f-name">Name</label>
            <input id="f-name" value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })} />
            {errors.name && <span className="apro-err">{errors.name}</span>}</div>
          <div><label htmlFor="f-email">Email</label>
            <input id="f-email" type="email" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} />
            {errors.email && <span className="apro-err">{errors.email}</span>}</div>
          <div><label htmlFor="f-phone">Phone</label>
            <input id="f-phone" value={account.phoneNumber} onChange={(e) => setAccount({ ...account, phoneNumber: e.target.value })} />
            {errors.phoneNumber && <span className="apro-err">{errors.phoneNumber}</span>}</div>
          <div><label htmlFor="f-address">Address</label>
            <input id="f-address" value={account.address} onChange={(e) => setAccount({ ...account, address: e.target.value })} />
            {errors.address && <span className="apro-err">{errors.address}</span>}</div>
        </fieldset>
      )}

      <div><label>Role</label>
        <Select value={role} onValueChange={setRole} disabled={isEdit}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div><label htmlFor="f-spec">Specialization</label>
        <input id="f-spec" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
        {errors.specialization && <span className="apro-err">{errors.specialization}</span>}</div>

      <div><label htmlFor="f-exp">Experience (years)</label>
        <input id="f-exp" type="number" min="0" value={experience} onChange={(e) => setExperience(e.target.value)} />
        {errors.experience && <span className="apro-err">{errors.experience}</span>}</div>

      <div><label htmlFor="f-qual">Qualifications (comma-separated)</label>
        <input id="f-qual" value={qualifications} onChange={(e) => setQualifications(e.target.value)} /></div>

      <div><label htmlFor="f-bio">Bio</label>
        <textarea id="f-bio" maxLength={500} value={bio} onChange={(e) => setBio(e.target.value)} /></div>

      {isEdit && <p className="apro-readonly">Rating: ★ {rating.toFixed(1)} (read-only, from customer reviews)</p>}

      <div><label>Profile photo</label>
        <ImageManager value={photo} onChange={setPhoto} uploadUrl="/admin/professionals/upload-image" max={1} label="Photo" />
      </div>

      <div className="apro-services">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <label>Services</label>
          <button type="button" onClick={addService}>+ Add service</button>
        </div>
        {services.map((sv, i) => (
          <div key={i} className="apro-service-row" style={{ display: "flex", gap: 8 }}>
            <input aria-label={`service-name-${i}`} placeholder="Name" value={sv.name} onChange={(e) => setService(i, { name: e.target.value })} />
            <input aria-label={`service-price-${i}`} type="number" min="0" placeholder="Rs" value={sv.price} onChange={(e) => setService(i, { price: Number(e.target.value) })} />
            <input aria-label={`service-duration-${i}`} type="number" min="15" placeholder="min" value={sv.duration} onChange={(e) => setService(i, { duration: Number(e.target.value) })} />
            <button type="button" onClick={() => removeService(i)}>✕</button>
          </div>
        ))}
      </div>

      <div className="apro-availability">
        <label>Weekly availability</label>
        {DAYS.map((day) => (
          <div key={day} className="apro-avail-row" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label style={{ width: 110, textTransform: "capitalize" }}>
              <input type="checkbox" checked={availability[day].isAvailable} onChange={(e) => setDay(day, { isAvailable: e.target.checked })} /> {day}
            </label>
            <input type="time" aria-label={`${day}-start`} value={availability[day].startTime} onChange={(e) => setDay(day, { startTime: e.target.value })} disabled={!availability[day].isAvailable} />
            <input type="time" aria-label={`${day}-end`} value={availability[day].endTime} onChange={(e) => setDay(day, { endTime: e.target.value })} disabled={!availability[day].isAvailable} />
          </div>
        ))}
      </div>

      <div className="apro-actions" style={{ marginTop: "1.5rem", display: "flex", gap: 12 }}>
        <button type="submit" disabled={saving}>{saving ? "Saving…" : isEdit ? "Save changes" : "Create"}</button>
        <button type="button" onClick={() => navigate("/admin/professionals")}>Cancel</button>
      </div>
    </form>
  );
};

export default AdminProfessionalForm;
