const SERIES = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
];

export function buildTickerColors(tickers) {
  return Object.fromEntries(tickers.map((t, i) => [t, SERIES[i % SERIES.length]]));
}
