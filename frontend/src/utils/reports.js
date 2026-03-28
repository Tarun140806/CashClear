const REPORTS_KEY = "cashclear_reports";

export function saveReport(data) {
  try {
    const existing = loadReports();
    const report = {
      id: `report-${Date.now()}`,
      createdAt: new Date().toISOString(),
      cash_balance: data.cash_balance,
      total_obligations: data.total_obligations,
      shortfall: data.shortfall,
      days_to_zero: data.days_to_zero,
      obligationCount: (data.prioritized_obligations || []).length,
      reasoning: data.reasoning || "",
      prioritized_obligations: data.prioritized_obligations || [],
    };
    const updated = [report, ...existing].slice(0, 50); // keep last 50
    localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
    return report;
  } catch {
    return null;
  }
}

export function loadReports() {
  try {
    return JSON.parse(localStorage.getItem(REPORTS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearReports() {
  localStorage.removeItem(REPORTS_KEY);
}
