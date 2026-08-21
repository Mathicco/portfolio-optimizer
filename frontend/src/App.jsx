import { useState } from "react";
import TickerForm from "./components/TickerForm";
import StatTile from "./components/StatTile";
import FrontierChart from "./components/FrontierChart";
import WeightsBar from "./components/WeightsBar";
import { optimizePortfolio } from "./lib/api";
import "./App.css";

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(tickers, period) {
    setLoading(true);
    setError(null);
    try {
      const data = await optimizePortfolio(tickers, period);
      setResult(data);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Portfolio Optimizer</h1>
        <p>Allocation optimale selon la théorie moderne du portefeuille (Markowitz)</p>
      </header>

      <main className="app-main">
        <aside className="panel">
          <TickerForm onSubmit={handleSubmit} loading={loading} />
          {error && <p className="error">{error}</p>}
        </aside>

        <section className="results">
          {!result && !loading && !error && (
            <div className="empty-state">
              <p>Choisis au moins deux actifs et lance l'optimisation.</p>
            </div>
          )}

          {loading && (
            <div className="empty-state">
              <p>Récupération des données et calcul de la frontière efficiente…</p>
            </div>
          )}

          {result && !loading && (
            <>
              <div className="stat-row">
                <StatTile label="Rendement attendu" value={`${result.expected_return.toFixed(2)}%`} />
                <StatTile label="Volatilité" value={`${result.volatility.toFixed(2)}%`} />
                <StatTile
                  label="Ratio de Sharpe"
                  value={result.sharpe_ratio.toFixed(2)}
                  tone={result.sharpe_ratio >= 1 ? "good" : undefined}
                />
              </div>

              <FrontierChart
                frontier={{
                  volatilities: result.frontier_volatilities,
                  returns: result.frontier_returns,
                }}
                optimal={{ volatility: result.volatility, return: result.expected_return }}
              />

              <WeightsBar weights={result.optimal_weights} />
            </>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <span>FastAPI + scipy.optimize (SLSQP) · React + Recharts · Données Yahoo Finance</span>
      </footer>
    </div>
  );
}

export default App;
