import { useState } from "react";

const PERIODS = [
  { value: "6mo", label: "6 mois" },
  { value: "1y", label: "1 an" },
  { value: "3y", label: "3 ans" },
  { value: "5y", label: "5 ans" },
];

export default function TickerForm({ onSubmit, loading }) {
  const [tickers, setTickers] = useState(["AAPL", "MSFT", "GOOGL"]);
  const [draft, setDraft] = useState("");
  const [period, setPeriod] = useState("1y");

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

  function handleSubmit(e) {
    e.preventDefault();
    if (draft.trim()) addTicker(draft);
    onSubmit(tickers, period);
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

      <button type="submit" className="primary" disabled={loading || tickers.length < 2}>
        {loading ? "Optimisation…" : "Optimiser le portefeuille"}
      </button>
    </form>
  );
}
