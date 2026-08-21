const SERIES = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
];

export default function WeightsBar({ weights }) {
  const entries = Object.entries(weights).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, w]) => w));

  return (
    <div className="weights-bar">
      <h3>Allocation optimale</h3>
      <ul>
        {entries.map(([ticker, weight], i) => (
          <li key={ticker}>
            <span className="ticker-label">{ticker}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${(weight / max) * 100}%`,
                  background: SERIES[i % SERIES.length],
                }}
              />
            </div>
            <span className="bar-value">{(weight * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
