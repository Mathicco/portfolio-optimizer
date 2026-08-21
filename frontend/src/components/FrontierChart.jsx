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
import InfoTooltip from "./InfoTooltip";

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

export default function FrontierChart({ frontier, random, optimal, objectiveLabel }) {
  const data = frontier.volatilities.map((v, i) => ({
    volatility: v,
    return: frontier.returns[i],
  }));

  const cloud = random.volatilities.map((v, i) => ({
    volatility: v,
    return: random.returns[i],
  }));

  return (
    <div className="frontier-chart">
      <h3>
        Frontière efficiente
        <InfoTooltip text="Chaque point gris est un portefeuille possible avec des poids différents. La ligne bleue relie, pour chaque niveau de risque, le portefeuille qui offre le meilleur rendement possible : c'est la frontière efficiente. Aucun point ne peut se trouver au-dessus." />
      </h3>
      <p className="section-hint">
        Le point orange est le meilleur compromis rendement/risque selon l'objectif choisi — à gauche de la courbe, aucun portefeuille n'existe ; en dessous, on peut toujours faire mieux pour le même risque.
      </p>
      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart data={data} margin={{ top: 16, right: 24, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="var(--grid)" strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="volatility"
            type="number"
            allowDuplicatedCategory={false}
            domain={["dataMin", "dataMax"]}
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
            stroke="var(--baseline)"
            tickFormatter={(v) => `${v.toFixed(0)}%`}
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
          <Scatter
            data={cloud}
            dataKey="return"
            shape={(props) => (
              <circle cx={props.cx} cy={props.cy} r={2} fill="var(--text-muted)" fillOpacity={0.35} />
            )}
            isAnimationActive={false}
          />
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
        <span><i className="dot" style={{ background: "var(--text-muted)", opacity: 0.5 }} />Portefeuilles aléatoires</span>
        <span><i className="dot" style={{ background: "var(--series-1)" }} />Frontière efficiente</span>
        <span><i className="dot" style={{ background: "var(--series-2)" }} />{objectiveLabel}</span>
      </div>
    </div>
  );
}
