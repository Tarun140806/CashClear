import { useState } from "react";

function InputForm({
  cashBalance,
  onCashBalance,
  onAddObligation,
  onImportFile,
  onAnalyze,
}) {
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [penaltyIfLate, setPenaltyIfLate] = useState("");
  const [flexibility, setFlexibility] = useState("medium");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");

  const handleCashBalanceChange = (event) => {
    const value = event.target.value;
    onCashBalance(Number(value || 0));
  };

  const handleAddObligation = (event) => {
    event.preventDefault();

    if (!vendor || !amount || !dueDate) {
      return;
    }

    onAddObligation({
      id: `ob-${Date.now()}`,
      vendor,
      amount: Number(amount),
      due_date: dueDate,
      penalty_if_late: Number(penaltyIfLate || 0),
      flexibility,
    });

    setVendor("");
    setAmount("");
    setDueDate("");
    setPenaltyIfLate("");
    setFlexibility("medium");
  };

  const handleImportDocument = async () => {
    if (!uploadFile || !onImportFile) {
      return;
    }

    setUploadMessage("Importing file...");
    try {
      const importedCount = await onImportFile(uploadFile);
      setUploadMessage(
        `Imported ${importedCount} obligation(s) from ${uploadFile.name}.`,
      );
      setUploadFile(null);
    } catch (error) {
      setUploadMessage(error?.message || "Failed to import file.");
    }
  };

  return (
    <section className="panel">
      <h2 className="panel-title">Input Financial Data</h2>

      <div className="upload-row">
        <input
          type="file"
          accept=".csv,.pdf,image/png,image/jpeg,image/jpg,image/webp"
          onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
          className="field-input"
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleImportDocument}
          disabled={!uploadFile}
        >
          Import CSV/PDF/Image
        </button>
      </div>
      {uploadMessage && <p className="helper-text">{uploadMessage}</p>}

      <div className="cash-field">
        <label className="field-label">
          Cash Balance
          <input
            type="number"
            value={cashBalance}
            onChange={handleCashBalanceChange}
            className="field-input"
            placeholder="230000"
          />
        </label>
      </div>

      <form onSubmit={handleAddObligation} className="obligation-grid">
        <input
          value={vendor}
          onChange={(event) => setVendor(event.target.value)}
          className="field-input"
          placeholder="Vendor"
          required
        />
        <input
          type="number"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="field-input"
          placeholder="Amount"
          required
        />
        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className="field-input"
          required
        />
        <input
          type="number"
          value={penaltyIfLate}
          onChange={(event) => setPenaltyIfLate(event.target.value)}
          className="field-input"
          placeholder="Penalty if late"
        />
        <select
          value={flexibility}
          onChange={(event) => setFlexibility(event.target.value)}
          className="field-input field-select"
        >
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>

        <div className="button-row">
          <button type="submit" className="btn btn-primary">
            Add Obligation
          </button>

          <button
            type="button"
            onClick={onAnalyze}
            className="btn btn-secondary"
          >
            Analyze
          </button>
        </div>
      </form>
    </section>
  );
}

export default InputForm;
