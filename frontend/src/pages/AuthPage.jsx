import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

export default function AuthPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", role: "Analyst" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (mode === "signup" && form.password !== form.confirm) {
      return setError("Passwords do not match.");
    }
    setLoading(true);
    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await signup({ name: form.name, email: form.email, password: form.password, role: form.role });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === "login" ? "signup" : "login"));
    setError("");
    setForm({ name: "", email: "", password: "", confirm: "", role: "Analyst" });
  };

  return (
    <div className="auth-shell">
      {/* Animated background */}
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />
      <div className="auth-bg-orb auth-bg-orb-3" />
      <div className="auth-grid" />

      <div className="auth-layout">
        {/* Left branding panel */}
        <div className="auth-brand-panel">
          <div className="auth-brand-inner">
            <div className="auth-logo">
              <span className="auth-logo-icon">💎</span>
              <span className="auth-logo-name">CashClear</span>
            </div>
            <h1 className="auth-brand-headline">
              Intelligent<br />
              <span className="auth-brand-gradient">Cash Flow</span><br />
              Management
            </h1>
            <p className="auth-brand-sub">
              Prioritize obligations, estimate risk, and protect your working
              capital — powered by AI.
            </p>
            <div className="auth-feature-list">
              {[
                { icon: "⚡", text: "Real-time obligation analysis" },
                { icon: "🛡", text: "Risk-level scoring & alerts" },
                { icon: "📊", text: "AI-generated reasoning" },
                { icon: "📁", text: "CSV · PDF · Image import" },
              ].map(({ icon, text }) => (
                <div key={text} className="auth-feature">
                  <span className="auth-feature-icon">{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-form-panel">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2 className="auth-card-title">
                {mode === "login" ? "Welcome back" : "Create account"}
              </h2>
              <p className="auth-card-sub">
                {mode === "login"
                  ? "Sign in to your CashClear account"
                  : "Get started with CashClear today"}
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {mode === "signup" && (
                <>
                  <div className="auth-field">
                    <label className="auth-label" htmlFor="auth-name">Full Name</label>
                    <input
                      id="auth-name"
                      type="text"
                      className="auth-input"
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={set("name")}
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div className="auth-field">
                    <label className="auth-label" htmlFor="auth-role">Role</label>
                    <select
                      id="auth-role"
                      className="auth-input auth-select"
                      value={form.role}
                      onChange={set("role")}
                    >
                      <option value="Analyst">Analyst</option>
                      <option value="Finance Manager">Finance Manager</option>
                      <option value="CFO">CFO</option>
                      <option value="Accountant">Accountant</option>
                    </select>
                  </div>
                </>
              )}

              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-email">Email</label>
                <input
                  id="auth-email"
                  type="email"
                  className="auth-input"
                  placeholder="jane@company.com"
                  value={form.email}
                  onChange={set("email")}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set("password")}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>

              {mode === "signup" && (
                <div className="auth-field">
                  <label className="auth-label" htmlFor="auth-confirm">Confirm Password</label>
                  <input
                    id="auth-confirm"
                    type="password"
                    className="auth-input"
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={set("confirm")}
                    required
                    autoComplete="new-password"
                  />
                </div>
              )}

              {error && (
                <div className="auth-error">
                  <span>⚠</span> {error}
                </div>
              )}

              <button
                id={mode === "login" ? "login-submit-btn" : "signup-submit-btn"}
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="auth-spinner" />
                ) : mode === "login" ? (
                  "Sign In →"
                ) : (
                  "Create Account →"
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <p className="auth-toggle">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
              {" "}
              <button
                id={mode === "login" ? "go-to-signup-btn" : "go-to-login-btn"}
                type="button"
                className="auth-toggle-btn"
                onClick={toggleMode}
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
