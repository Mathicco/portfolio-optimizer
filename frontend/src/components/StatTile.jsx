import InfoTooltip from "./InfoTooltip";

export default function StatTile({ label, value, tone, hint, caption }) {
  return (
    <div className="stat-tile">
      <span className="stat-label">
        {label}
        {hint && <InfoTooltip text={hint} />}
      </span>
      <span className={`stat-value${tone ? ` tone-${tone}` : ""}`}>{value}</span>
      {caption && <span className={`stat-caption${tone ? ` tone-${tone}` : ""}`}>{caption}</span>}
    </div>
  );
}
