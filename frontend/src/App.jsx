import { useState } from "react";
import InputForm from "./components/InputForm";
import Results from "./components/Results";
import "./App.css";

const formatCurrency = (value) => {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numeric) ? numeric : 0);
};

function App() {
  const [cash_balance, setCashBalance] = useState(0);
  const [obligations, setObligations] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCashBalance = (value) => {
    setCashBalance(value);
  };

  const handleAddObligation = (obligation) => {
    setObligations((prev) => [...prev, obligation]);
  };

  const handleImportFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://localhost:8000/upload/document", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    const importedObligations = Array.isArray(data.obligations)
      ? data.obligations
      : [];

    if (
      typeof data.cash_balance === "number" &&
      Number.isFinite(data.cash_balance)
    ) {
      setCashBalance(data.cash_balance);
    }

    if (importedObligations.length > 0) {
      setObligations((prev) => [...prev, ...importedObligations]);
    }

    return importedObligations.length;
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cash_balance,
          obligations,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to analyze obligations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <div className="grid-glow" />
      <div className="app-wrap dashboard-grid">
        <aside className="side-nav panel-like">
          <h2 className="brand">CashClear</h2>
          <nav>
            <button className="nav-link nav-link-active" type="button">
              <span className="nav-icon">▦</span>
              Dashboard
            </button>
            <button className="nav-link" type="button">
              <span className="nav-icon">◉</span>
              My Account
            </button>
            <button className="nav-link" type="button">
              <span className="nav-icon">◎</span>
              Team
            </button>
            <button className="nav-link" type="button">
              <span className="nav-icon">▤</span>
              Reports
            </button>
          </nav>
          <div className="side-footer">Decision Engine v1</div>
        </aside>

        <section className="content-area">
          <header className="hero panel-like">
            <div>
              <h1 className="app-title">CashClear Decision Engine</h1>
              <p className="app-subtitle">
                Prioritize obligations, estimate risk, and protect working
                capital.
              </p>
            </div>
            <div className="hero-stats">
              <div>
                <p className="mini-label">Cash Balance</p>
                <p className="mini-value">{formatCurrency(cash_balance)}</p>
              </div>
              <div>
                <p className="mini-label">Obligations Added</p>
                <p className="mini-value">{obligations.length}</p>
              </div>
            </div>
          </header>

          <InputForm
            cashBalance={cash_balance}
            onCashBalance={handleCashBalance}
            onAddObligation={handleAddObligation}
            onImportFile={handleImportFile}
            onAnalyze={handleAnalyze}
          />

          {loading && (
            <div className="state-block state-loading">
              <p>Analyzing...</p>
            </div>
          )}

          {error && <p className="state-block state-error">{error}</p>}

          {result && (
            <div className="results-wrap">
              <Results analysisResult={result} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
