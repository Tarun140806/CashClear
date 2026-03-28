import { useState } from "react";
import { loadReports, clearReports } from "../utils/reports";

const fmt = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n);
};

const fmtDate = (iso) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

export default function ReportsPage() {
  const [reports, setReports] = useState(() => loadReports());
  const [expanded, setExpanded] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClear = () => {
    clearReports();
    setReports([]);
    setExpanded(null);
    setConfirmClear(false);
  };

  const riskColor = {
    high:    "#ff8f8f",
    medium:  "#ffc453",
    low:     "var(--accent-5)",
    unknown: "var(--text-dim)",
  };

  if (reports.length === 0) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2 className="page-title">
            <span className="panel-title-icon">▦</span>
            Reports
          </h2>
        </div>
        <div className="panel reports-empty">
          <div className="reports-empty-icon">📋</div>
          <h3 className="reports-empty-title">No Reports Yet</h3>
          <p className="reports-empty-sub">
            Run an analysis on the Dashboard to generate your first report.
            All results are automatically saved here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">
          <span className="panel-title-icon">▦</span>
          Reports
          <span className="section-count" style={{ marginLeft: 8 }}>{reports.length}</span>
        </h2>
        {!confirmClear ? (
          <button
            className="btn btn-secondary"
            style={{ borderColor: "rgba(220,60,60,0.35)", color: "#ff8f8f" }}
            onClick={() => setConfirmClear(true)}
            id="clear-reports-btn"
          >
            Clear All
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-sub)" }}>Are you sure?</span>
            <button className="btn btn-secondary" style={{ borderColor: "rgba(220,60,60,0.5)", color: "#ff8f8f" }} onClick={handleClear} id="confirm-clear-btn">Yes, Delete</button>
            <button className="btn btn-secondary" onClick={() => setConfirmClear(false)}>Cancel</button>
          </div>
        )}
      </div>

      {/* Summary strip */}
      <div className="summary-grid">
        {[
          { label: "Total Reports",    value: reports.length,                                                               icon: "📊" },
          { label: "Avg Cash Balance", value: fmt(reports.reduce((s, r) => s + (r.cash_balance || 0), 0) / reports.length), icon: "💰" },
          { label: "Avg Shortfall",    value: fmt(reports.reduce((s, r) => s + (r.shortfall     || 0), 0) / reports.length), icon: "⚠️" },
          { label: "Latest Run",       value: fmtDate(reports[0].createdAt).split(",")[0],                                  icon: "🕐" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="summary-card">
            <p className="summary-label">{icon} {label}</p>
            <p className="summary-value" style={{ fontSize: "1.35rem" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Report list */}
      <div className="reports-list">
        {reports.map((report, idx) => {
          const isOpen = expanded === report.id;
          const highCount   = report.prioritized_obligations.filter((o) => o.risk_level === "high").length;
          const medCount    = report.prioritized_obligations.filter((o) => o.risk_level === "medium").length;
          const lowCount    = report.prioritized_obligations.filter((o) => o.risk_level === "low").length;

          return (
            <div key={report.id} className="report-card panel">
              {/* Header row */}
              <button
                className="report-card-header"
                onClick={() => setExpanded(isOpen ? null : report.id)}
                id={`report-toggle-${report.id}`}
              >
                <div className="report-card-left">
                  <span className="report-index">#{reports.length - idx}</span>
                  <div>
                    <p className="report-card-date">{fmtDate(report.createdAt)}</p>
                    <p className="report-card-meta">
                      {report.obligationCount} obligation{report.obligationCount !== 1 ? "s" : ""}
                      {highCount > 0 && <span className="report-risk-dot" style={{ background: riskColor.high }}>{highCount} high</span>}
                      {medCount  > 0 && <span className="report-risk-dot" style={{ background: riskColor.medium }}>{medCount} med</span>}
                      {lowCount  > 0 && <span className="report-risk-dot" style={{ background: riskColor.low }}>{lowCount} low</span>}
                    </p>
                  </div>
                </div>
                <div className="report-card-right">
                  <div className="report-metric">
                    <span className="report-metric-label">Balance</span>
                    <span className="report-metric-value">{fmt(report.cash_balance)}</span>
                  </div>
                  <div className="report-metric">
                    <span className="report-metric-label">Shortfall</span>
                    <span className="report-metric-value" style={{ color: "#ff8f8f" }}>{fmt(report.shortfall)}</span>
                  </div>
                  <span className="report-chevron" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
                </div>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="report-detail">
                  <div className="divider" />

                  {/* Mini metrics */}
                  <div className="report-detail-metrics">
                    {[
                      { label: "Cash Balance",      v: fmt(report.cash_balance) },
                      { label: "Total Obligations", v: fmt(report.total_obligations) },
                      { label: "Shortfall",         v: fmt(report.shortfall) },
                      { label: "Days to Zero",      v: report.days_to_zero ?? "—" },
                    ].map(({ label, v }) => (
                      <div key={label} className="summary-card" style={{ padding: "12px" }}>
                        <p className="summary-label">{label}</p>
                        <p className="summary-value" style={{ fontSize: "1.1rem" }}>{v}</p>
                      </div>
                    ))}
                  </div>

                  {/* Obligations mini table */}
                  {report.prioritized_obligations.length > 0 && (
                    <>
                      <p className="section-title" style={{ marginTop: 14, marginBottom: 8 }}>Prioritized Obligations</p>
                      <div className="table-wrap">
                        <table className="results-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Vendor</th>
                              <th>Amount</th>
                              <th>Score</th>
                              <th>Can Pay</th>
                              <th>Risk</th>
                            </tr>
                          </thead>
                          <tbody>
                            {report.prioritized_obligations.map((o, i) => (
                              <tr key={o.id || i} className={`row-risk-${o.risk_level || "unknown"}`}>
                                <td style={{ color: "var(--text-dim)" }}>{i + 1}</td>
                                <td style={{ fontWeight: 600 }}>{o.vendor || "—"}</td>
                                <td>{fmt(o.amount)}</td>
                                <td style={{ color: "var(--accent-2)", fontWeight: 700 }}>{o.score ?? "—"}</td>
                                <td><span className={o.can_pay ? "pay-yes" : "pay-no"}>{o.can_pay ? "✓ Yes" : "✗ No"}</span></td>
                                <td><span className={`risk-pill risk-${o.risk_level || "unknown"}`}>{o.risk_level || "—"}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {/* Reasoning */}
                  {report.reasoning && (
                    <>
                      <p className="section-title" style={{ marginTop: 14, marginBottom: 8 }}>AI Reasoning</p>
                      <div className="reasoning-card">
                        <p className="reasoning-text">{report.reasoning}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
