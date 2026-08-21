import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function FrontierTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <span>Volatilité {point.volatility.toFixed(2)}%</span>
      <span>Rendement {point.return.toFixed(2)}%</span>
    </div>
  );
}

export default function FrontierChart({ frontier, optimal }) {
  const data = frontier.volatilities.map((v, i) => ({
    volatility: v,
    return: frontier.returns[i],
  }));

  return (
    <div className="frontier-chart">
      <h3>Frontière efficiente</h3>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 16, right: 24, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="var(--grid)" strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="volatility"
            type="number"
            tickFormatter={(v) => `${v.toFixed(0)}%`}
            stroke="var(--baseline)"
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            label={{
              value: "Volatilité",
              position: "insideBottom",
              offset: -4,
              fill: "var(--text-muted)",
              fontSize: 12,
            }}
          />
          <YAxis
            dataKey="return"
            type="number"
            tickFormatter={(v) => `${v.toFixed(0)}%`}
            stroke="var(--baseline)"
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            label={{
              value: "Rendement",
              angle: -90,
              position: "insideLeft",
              fill: "var(--text-muted)",
              fontSize: 12,
            }}
          />
          <Tooltip content={<FrontierTooltip />} cursor={{ stroke: "var(--baseline)" }} />
          <Line
            type="monotone"
            dataKey="return"
            stroke="var(--series-1)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Scatter
            data={[{ volatility: optimal.volatility, return: optimal.return }]}
            dataKey="return"
            fill="var(--series-2)"
            shape={(props) => (
              <circle
                cx={props.cx}
                cy={props.cy}
                r={6}
                fill="var(--series-2)"
                stroke="var(--surface-1)"
                strokeWidth={2}
              />
            )}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="frontier-legend">
        <span><i className="dot" style={{ background: "var(--series-1)" }} />Frontière efficiente</span>
        <span><i className="dot" style={{ background: "var(--series-2)" }} />Portefeuille optimal (Sharpe max)</span>
      </div>
    </div>
  );
}
