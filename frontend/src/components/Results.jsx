function Results({ analysisResult }) {
  const formatCurrency = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return "-";
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(numeric);
  };

  if (!analysisResult) {
    return (
      <section className="panel">
        <p className="empty-text">No results yet</p>
      </section>
    );
  }

  const {
    cash_balance,
    total_obligations,
    shortfall,
    days_to_zero,
    prioritized_obligations = [],
    reasoning,
  } = analysisResult;

  return (
    <section className="panel results-panel">
      <h2 className="panel-title">Analysis Results</h2>

      <div className="summary-grid">
        <div className="summary-card">
          <p className="summary-label">Cash Balance</p>
          <p className="summary-value">{formatCurrency(cash_balance)}</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">Total Obligations</p>
          <p className="summary-value">{formatCurrency(total_obligations)}</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">Shortfall</p>
          <p className="summary-value">{formatCurrency(shortfall)}</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">Days to Zero</p>
          <p className="summary-value">{days_to_zero ?? "-"}</p>
        </div>
      </div>

      <div>
        <h3 className="section-title">Prioritized Obligations</h3>
        {prioritized_obligations.length === 0 ? (
          <p className="empty-text">No results yet</p>
        ) : (
          <div className="table-wrap">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Score</th>
                  <th>Can Pay</th>
                  <th>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {prioritized_obligations.map((item) => (
                  <tr
                    key={item.id || `${item.vendor}-${item.amount}`}
                    className={`row-risk-${item.risk_level || "unknown"}`}
                  >
                    <td>{item.vendor || "-"}</td>
                    <td>{formatCurrency(item.amount)}</td>
                    <td>{item.score ?? "-"}</td>
                    <td>{item.can_pay ? "Yes" : "No"}</td>
                    <td>
                      <span
                        className={`risk-pill risk-${item.risk_level || "unknown"}`}
                      >
                        {item.risk_level || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="reasoning-card">
        <h3 className="section-title">Reasoning</h3>
        <p className="reasoning-text">{reasoning || "No results yet"}</p>
      </div>
    </section>
  );
}

export default Results;
