import InfoTooltip from "./InfoTooltip";
import { concentrationInsight } from "../lib/insights";

export default function WeightsBar({ weights, tickerColors }) {
  const entries = Object.entries(weights).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, w]) => w));

  return (
    <div className="weights-bar">
      <h3>
        Allocation optimale
        <InfoTooltip text="La part du budget à investir dans chaque actif pour atteindre le portefeuille optimal. Un poids à 0% signifie que cet actif n'améliore pas le couple rendement/risque du portefeuille, compte tenu des autres." />
      </h3>
      <ul>
        {entries.map(([ticker, weight]) => (
          <li key={ticker}>
            <span className="ticker-label">{ticker}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${(weight / max) * 100}%`,
                  background: tickerColors[ticker],
                }}
              />
            </div>
            <span className="bar-value">{(weight * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>
      <p className="section-hint">{concentrationInsight(weights)}</p>
    </div>
  );
}
