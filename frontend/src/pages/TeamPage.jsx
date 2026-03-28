import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const TEAM_KEY = "cashclear_team";

function loadTeam(currentUser) {
  try {
    const stored = JSON.parse(localStorage.getItem(TEAM_KEY) || "[]");
    // Seed with current user if team is empty
    if (stored.length === 0) {
      const seed = [
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
          status: "active",
          joinedAt: currentUser.joinedAt,
          avatar: currentUser.avatar,
        },
      ];
      localStorage.setItem(TEAM_KEY, JSON.stringify(seed));
      return seed;
    }
    return stored;
  } catch {
    return [];
  }
}

function saveTeam(team) {
  localStorage.setItem(TEAM_KEY, JSON.stringify(team));
}

const ROLES = ["Analyst", "Finance Manager", "CFO", "Accountant", "Viewer"];

export default function TeamPage() {
  const { currentUser } = useAuth();
  const [team, setTeam] = useState(() => loadTeam(currentUser));
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Analyst" });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleInvite = (e) => {
    e.preventDefault();
    setError("");
    if (team.find((m) => m.email === form.email)) {
      return setError("A member with this email already exists.");
    }
    const newMember = {
      id: `member-${Date.now()}`,
      name: form.name,
      email: form.email,
      role: form.role,
      status: "invited",
      joinedAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(form.name)}&backgroundColor=5e8bff`,
    };
    const updated = [...team, newMember];
    saveTeam(updated);
    setTeam(updated);
    setForm({ name: "", email: "", role: "Analyst" });
    setShowInvite(false);
    setSuccessMsg(`${form.name} has been invited to the team.`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleRemove = (id) => {
    if (id === currentUser.id) return; // can't remove yourself
    const updated = team.filter((m) => m.id !== id);
    saveTeam(updated);
    setTeam(updated);
  };

  const STATUS_COLOR = {
    active:  { color: "var(--accent-5)", bg: "rgba(61,214,140,0.1)",  border: "rgba(61,214,140,0.25)" },
    invited: { color: "#ffc453",          bg: "rgba(255,196,83,0.1)", border: "rgba(255,196,83,0.25)" },
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">
          <span className="panel-title-icon">◎</span>
          Team
        </h2>
        <button
          className="btn btn-primary"
          onClick={() => { setShowInvite(true); setError(""); }}
          id="invite-member-btn"
        >
          + Invite Member
        </button>
      </div>

      {successMsg && <div className="helper-text">{successMsg}</div>}

      {/* Invite form */}
      {showInvite && (
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <span className="panel-title-icon">✉️</span>
              Invite New Member
            </h3>
            <button className="btn btn-secondary" onClick={() => setShowInvite(false)}>✕ Cancel</button>
          </div>
          <form onSubmit={handleInvite} className="obligation-grid">
            <div className="field-group">
              <label className="field-label" htmlFor="inv-name">Full Name</label>
              <input id="inv-name" className="field-input" value={form.name} onChange={set("name")} placeholder="Jane Smith" required />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="inv-email">Email</label>
              <input id="inv-email" type="email" className="field-input" value={form.email} onChange={set("email")} placeholder="jane@company.com" required />
            </div>
            <div className="field-group full-width">
              <label className="field-label" htmlFor="inv-role">Role</label>
              <select id="inv-role" className="field-input" value={form.role} onChange={set("role")}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {error && <div className="state-block state-error full-width">⚠ {error}</div>}
            <div className="button-row">
              <button type="submit" className="btn btn-primary" id="send-invite-btn">Send Invitation</button>
            </div>
          </form>
        </div>
      )}

      {/* Team stats */}
      <div className="summary-grid">
        {[
          { label: "Total Members", value: team.length,                                    icon: "👥" },
          { label: "Active",        value: team.filter((m) => m.status === "active").length,  icon: "✅" },
          { label: "Invited",       value: team.filter((m) => m.status === "invited").length, icon: "📨" },
          { label: "Roles",         value: new Set(team.map((m) => m.role)).size,            icon: "🏷" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="summary-card">
            <p className="summary-label">{icon} {label}</p>
            <p className="summary-value">{value}</p>
          </div>
        ))}
      </div>

      {/* Members list */}
      <div className="panel">
        <h3 className="panel-title" style={{ marginBottom: "16px" }}>
          <span className="panel-title-icon">👤</span>
          Members
          <span className="section-count" style={{ marginLeft: 8 }}>{team.length}</span>
        </h3>
        <div className="team-list">
          {team.map((member) => {
            const st = STATUS_COLOR[member.status] || STATUS_COLOR.invited;
            const isMe = member.id === currentUser.id;
            return (
              <div key={member.id} className="team-member-row">
                <img src={member.avatar} alt={member.name} className="team-avatar" />
                <div className="team-member-info">
                  <p className="team-member-name">
                    {member.name}
                    {isMe && <span className="team-you-badge">you</span>}
                  </p>
                  <p className="team-member-email">{member.email}</p>
                </div>
                <span className="team-role-pill">{member.role}</span>
                <span
                  className="risk-pill"
                  style={{ color: st.color, background: st.bg, border: `1px solid ${st.border}` }}
                >
                  {member.status}
                </span>
                {!isMe && (
                  <button
                    className="btn btn-secondary"
                    style={{ padding: "6px 12px", fontSize: "0.8rem", borderColor: "rgba(220,60,60,0.3)", color: "#ff8f8f" }}
                    onClick={() => handleRemove(member.id)}
                    id={`remove-member-${member.id}`}
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
