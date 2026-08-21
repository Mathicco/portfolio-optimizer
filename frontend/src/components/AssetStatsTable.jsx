import InfoTooltip from "./InfoTooltip";

export default function AssetStatsTable({ stats, weights, tickerColors }) {
  const tickers = Object.keys(stats);

  return (
    <div className="asset-table">
      <h3>
        Statistiques par actif
        <InfoTooltip text="Rendement et volatilité de chaque actif pris isolément, avant optimisation — utile pour comprendre pourquoi l'algorithme lui donne (ou non) du poids." />
      </h3>
      <table>
        <thead>
          <tr>
            <th>Actif</th>
            <th>Rendement annualisé</th>
            <th>Volatilité annualisée</th>
            <th>Poids optimal</th>
          </tr>
        </thead>
        <tbody>
          {tickers.map((ticker) => (
            <tr key={ticker}>
              <td>
                <span className="ticker-swatch" style={{ background: tickerColors[ticker] }} />
                {ticker}
              </td>
              <td className={stats[ticker].expected_return >= 0 ? "tone-good" : "tone-bad"}>
                {stats[ticker].expected_return >= 0 ? "+" : ""}
                {stats[ticker].expected_return.toFixed(2)}%
              </td>
              <td>{stats[ticker].volatility.toFixed(2)}%</td>
              <td>{(weights[ticker] * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
