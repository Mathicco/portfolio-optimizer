export function sharpeInsight(value) {
  if (value >= 2) return { label: "Excellent rapport rendement/risque", tone: "good" };
  if (value >= 1) return { label: "Bon rapport rendement/risque", tone: "good" };
  if (value >= 0) return { label: "Rapport rendement/risque faible", tone: undefined };
  return { label: "Risque non rémunéré par le rendement", tone: "bad" };
}

export function concentrationInsight(weights) {
  const entries = Object.entries(weights).filter(([, w]) => w > 0.01);
  const [topTicker, topWeight] = entries.reduce((a, b) => (b[1] > a[1] ? b : a));

  if (topWeight >= 0.6) {
    return `Portefeuille concentré sur ${topTicker} (${(topWeight * 100).toFixed(0)}%) — peu de diversification.`;
  }
  return `Réparti entre ${entries.length} actifs, sans position dominante.`;
}
