import { useState } from "react";

const PERIODS = [
  { value: "6mo", label: "6 mois" },
  { value: "1y", label: "1 an" },
  { value: "3y", label: "3 ans" },
  { value: "5y", label: "5 ans" },
];

const PRESETS = [
  { label: "Tech US", tickers: ["AAPL", "MSFT", "GOOGL", "NVDA"] },
  { label: "Diversifié", tickers: ["SPY", "BND", "GLD", "VNQ"] },
  { label: "Dividendes", tickers: ["JNJ", "PG", "KO", "PEP"] },
  { label: "Indices monde", tickers: ["SPY", "EFA", "EEM", "AGG"] },
];

export default function TickerForm({ onSubmit, loading }) {
  const [tickers, setTickers] = useState(["AAPL", "MSFT", "GOOGL"]);
  const [draft, setDraft] = useState("");
  const [period, setPeriod] = useState("1y");
  const [objective, setObjective] = useState("max_sharpe");
  const [riskFreeRate, setRiskFreeRate] = useState(2);

  function addTicker(raw) {
    const symbol = raw.trim().toUpperCase();
    if (!symbol || tickers.includes(symbol)) return;
    setTickers([...tickers, symbol]);
    setDraft("");
  }

  function removeTicker(symbol) {
    setTickers(tickers.filter((t) => t !== symbol));
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTicker(draft);
    } else if (e.key === "Backspace" && !draft && tickers.length) {
      removeTicker(tickers[tickers.length - 1]);
    }
  }

  function applyPreset(preset) {
    setTickers(preset.tickers);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const finalTickers = draft.trim()
      ? [...tickers, draft.trim().toUpperCase()]
      : tickers;
    if (draft.trim()) setDraft("");
    onSubmit({
      tickers: finalTickers,
      period,
      objective,
      riskFreeRate: riskFreeRate / 100,
    });
  }

  return (
    <form className="ticker-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="ticker-input">Actifs</label>
        <div className="ticker-input-shell">
          {tickers.map((symbol) => (
            <span className="chip" key={symbol}>
              {symbol}
              <button
                type="button"
                aria-label={`Retirer ${symbol}`}
                onClick={() => removeTicker(symbol)}
              >
                ×
              </button>
            </span>
          ))}
          <input
            id="ticker-input"
            type="text"
            value={draft}
            placeholder={tickers.length ? "" : "AAPL, MSFT, GOOGL..."}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <p className="hint">Entrée ou virgule pour ajouter un ticker</p>
      </div>

      <div className="field">
        <span className="field-label">Presets</span>
        <div className="preset-row">
          {PRESETS.map((preset) => (
            <button
              type="button"
              key={preset.label}
              className="preset-chip"
              onClick={() => applyPreset(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="field-label">Objectif</span>
        <div className="segmented">
          <button
            type="button"
            className={objective === "max_sharpe" ? "active" : ""}
            onClick={() => setObjective("max_sharpe")}
          >
            Max Sharpe
          </button>
          <button
            type="button"
            className={objective === "min_volatility" ? "active" : ""}
            onClick={() => setObjective("min_volatility")}
          >
            Min Volatilité
          </button>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="period-select">Période</label>
          <select
            id="period-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="rfr-input">Taux sans risque</label>
          <div className="rfr-input-shell">
            <input
              id="rfr-input"
              type="number"
              min="0"
              max="15"
              step="0.1"
              value={riskFreeRate}
              onChange={(e) => setRiskFreeRate(Number(e.target.value))}
            />
            <span>%</span>
          </div>
        </div>
      </div>

      <button type="submit" className="primary" disabled={loading || tickers.length < 2}>
        {loading ? "Optimisation…" : "Optimiser le portefeuille"}
      </button>
    </form>
  );
}
