import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AccountPage() {
  const { currentUser, updateProfile, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: currentUser.name, role: currentUser.role });
  const [saved, setSaved] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(form);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const joined = new Date(currentUser.joinedAt).toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric",
  });

  const ROLES = ["Analyst", "Finance Manager", "CFO", "Accountant"];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">
          <span className="panel-title-icon">◈</span>
          My Account
        </h2>
        <button className="btn btn-secondary" onClick={logout} id="logout-btn">
          Sign Out
        </button>
      </div>

      {/* Profile Card */}
      <div className="panel account-profile-card">
        <div className="account-avatar-row">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="account-avatar"
          />
          <div>
            <p className="account-name">{currentUser.name}</p>
            <span className="account-role-badge">{currentUser.role}</span>
            <p className="account-email">{currentUser.email}</p>
          </div>
        </div>
        <p className="account-joined">Member since {joined}</p>
      </div>

      {/* Edit Profile */}
      <div className="panel">
        <div className="panel-header">
          <h3 className="panel-title">
            <span className="panel-title-icon">✏️</span>
            Profile Settings
          </h3>
          {!editing && (
            <button
              className="btn btn-secondary"
              onClick={() => setEditing(true)}
              id="edit-profile-btn"
            >
              Edit
            </button>
          )}
        </div>

        {saved && (
          <div className="helper-text" style={{ marginBottom: "14px" }}>
            ✓ Profile updated successfully.
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSave} className="obligation-grid">
            <div className="field-group">
              <label className="field-label" htmlFor="acc-name">Full Name</label>
              <input
                id="acc-name"
                className="field-input"
                value={form.name}
                onChange={set("name")}
                required
              />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="acc-role">Role</label>
              <select
                id="acc-role"
                className="field-input"
                value={form.role}
                onChange={set("role")}
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="button-row">
              <button type="submit" className="btn btn-primary" id="save-profile-btn">Save Changes</button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="account-info-grid">
            {[
              { label: "Full Name", value: currentUser.name },
              { label: "Email",     value: currentUser.email },
              { label: "Role",      value: currentUser.role },
              { label: "User ID",   value: currentUser.id },
            ].map(({ label, value }) => (
              <div key={label} className="account-info-item">
                <p className="summary-label">{label}</p>
                <p className="account-info-value">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="panel danger-zone">
        <h3 className="panel-title" style={{ color: "#ff8f8f", marginBottom: "10px" }}>
          <span className="panel-title-icon">⚠️</span>
          Danger Zone
        </h3>
        <p style={{ color: "var(--text-sub)", fontSize: "0.88rem", marginBottom: "14px" }}>
          Signing out will clear your active session. Your data remains saved locally.
        </p>
        <button className="btn btn-secondary" style={{ borderColor: "rgba(220,60,60,0.4)", color: "#ff8f8f" }} onClick={logout}>
          Sign Out of CashClear
        </button>
      </div>
    </div>
  );
}
