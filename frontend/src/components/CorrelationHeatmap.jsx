import { Fragment } from "react";
import InfoTooltip from "./InfoTooltip";

export default function CorrelationHeatmap({ matrix }) {
  const tickers = Object.keys(matrix);

  function cellStyle(value) {
    const alpha = Math.round(Math.abs(value) * 90);
    const hue = value >= 0 ? "var(--series-1)" : "var(--critical)";
    return {
      background: `color-mix(in oklab, ${hue} ${alpha}%, var(--surface-1))`,
      color: alpha > 45 ? "#ffffff" : "var(--text-primary)",
    };
  }

  return (
    <div className="correlation-heatmap">
      <h3>
        Corrélation entre actifs
        <InfoTooltip text="Mesure si deux actifs bougent ensemble, de -1 à 1. Proche de 1 : ils montent et baissent en même temps (diversification faible). Proche de 0 ou négatif : ils évoluent indépendamment, ce qui réduit le risque global du portefeuille." />
      </h3>
      <div className="heatmap-grid" style={{ gridTemplateColumns: `64px repeat(${tickers.length}, 1fr)` }}>
        <div className="heatmap-corner" />
        {tickers.map((t) => (
          <div className="heatmap-col-label" key={`col-${t}`}>{t}</div>
        ))}
        {tickers.map((rowTicker) => (
          <Fragment key={rowTicker}>
            <div className="heatmap-row-label">{rowTicker}</div>
            {tickers.map((colTicker) => (
              <div
                className="heatmap-cell"
                key={`${rowTicker}-${colTicker}`}
                style={cellStyle(matrix[rowTicker][colTicker])}
              >
                {matrix[rowTicker][colTicker].toFixed(2)}
              </div>
            ))}
          </Fragment>
        ))}
      </div>
      <div className="heatmap-legend">
        <span><i className="dot" style={{ background: "var(--critical)" }} />Corrélation négative</span>
        <span><i className="dot" style={{ background: "var(--series-1)" }} />Corrélation positive</span>
      </div>
    </div>
  );
}
