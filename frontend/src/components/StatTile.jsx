export default function StatTile({ label, value, tone }) {
  return (
    <div className="stat-tile">
      <span className="stat-label">{label}</span>
      <span className={`stat-value${tone ? ` tone-${tone}` : ""}`}>{value}</span>
    </div>
  );
}
