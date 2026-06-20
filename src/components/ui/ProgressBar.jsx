export default function ProgressBar({ value = 0, label, color = 'blue', showLabel = true }) {
  const colors = {
    blue:  'bg-accent',
    green: 'bg-success',
    amber: 'bg-warning',
    red:   'bg-danger',
  };
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          {label && <span className="text-xs text-muted">{label}</span>}
          <span className="text-xs font-semibold text-slate-700 ml-auto">{value}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colors[color] || colors.blue}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
