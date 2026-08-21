const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function optimizePortfolio({ tickers, period, objective, riskFreeRate }) {
  const res = await fetch(`${API_BASE}/api/optimize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tickers,
      period,
      objective,
      risk_free_rate: riskFreeRate,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail || `Erreur serveur (${res.status})`);
  }

  return res.json();
}
