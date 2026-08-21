import { useState } from "react";
import TickerForm from "./components/TickerForm";
import StatTile from "./components/StatTile";
import FrontierChart from "./components/FrontierChart";
import WeightsBar from "./components/WeightsBar";
import CorrelationHeatmap from "./components/CorrelationHeatmap";
import AssetStatsTable from "./components/AssetStatsTable";
import { optimizePortfolio } from "./lib/api";
import { buildTickerColors } from "./lib/colors";
import { sharpeInsight } from "./lib/insights";
import "./App.css";

const OBJECTIVE_LABEL = {
  max_sharpe: "Portefeuille optimal (Sharpe max)",
  min_volatility: "Portefeuille optimal (volatilité min)",
};

function App() {
  const [result, setResult] = useState(null);
  const [objective, setObjective] = useState("max_sharpe");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(params) {
    setLoading(true);
    setError(null);
    setObjective(params.objective);
    try {
      const data = await optimizePortfolio(params);
      setResult(data);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
  }

  const tickerColors = result ? buildTickerColors(Object.keys(result.optimal_weights)) : {};

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Portfolio Optimizer</h1>
          <p>Allocation optimale selon la théorie moderne du portefeuille (Markowitz)</p>
        </div>
        {result && (
          <button type="button" className="ghost" onClick={handleReset}>
            Réinitialiser
          </button>
        )}
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
            <div className="skeleton-state">
              <div className="skeleton-row">
                <div className="skeleton skeleton-tile" />
                <div className="skeleton skeleton-tile" />
                <div className="skeleton skeleton-tile" />
              </div>
              <div className="skeleton skeleton-chart" />
              <p className="skeleton-caption">Récupération des données et calcul de la frontière efficiente…</p>
            </div>
          )}

          {result && !loading && (
            <div className="results-in">
              <div className="stat-row">
                <StatTile
                  label="Rendement attendu"
                  value={`${result.expected_return.toFixed(2)}%`}
                  hint="Gain annuel moyen estimé pour ce portefeuille, en extrapolant les rendements historiques de la période choisie. Une estimation, pas une garantie."
                />
                <StatTile
                  label="Volatilité"
                  value={`${result.volatility.toFixed(2)}%`}
                  hint="Amplitude typique des variations annuelles du portefeuille. Plus elle est élevée, plus la valeur du portefeuille peut fluctuer fortement (à la hausse comme à la baisse)."
                />
                <StatTile
                  label="Ratio de Sharpe"
                  value={result.sharpe_ratio.toFixed(2)}
                  hint="Rendement obtenu par unité de risque prise, au-delà du taux sans risque. Plus il est élevé, meilleur est le compromis rendement/risque."
                  tone={sharpeInsight(result.sharpe_ratio).tone}
                  caption={sharpeInsight(result.sharpe_ratio).label}
                />
              </div>

              <FrontierChart
                frontier={{
                  volatilities: result.frontier_volatilities,
                  returns: result.frontier_returns,
                }}
                random={{
                  volatilities: result.random_volatilities,
                  returns: result.random_returns,
                }}
                optimal={{ volatility: result.volatility, return: result.expected_return }}
                objectiveLabel={OBJECTIVE_LABEL[objective]}
              />

              <div className="results-grid">
                <WeightsBar weights={result.optimal_weights} tickerColors={tickerColors} />
                <CorrelationHeatmap matrix={result.correlation_matrix} />
              </div>

              <AssetStatsTable stats={result.asset_stats} weights={result.optimal_weights} tickerColors={tickerColors} />
            </div>
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
