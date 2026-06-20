export default function Badge({ children, color = 'gray', className = '' }) {
  const colors = {
    green:  'bg-emerald-50 text-emerald-700 border border-emerald-100',
    red:    'bg-red-50 text-red-700 border border-red-100',
    yellow: 'bg-amber-50 text-amber-700 border border-amber-100',
    blue:   'bg-blue-50 text-blue-700 border border-blue-100',
    purple: 'bg-purple-50 text-purple-700 border border-purple-100',
    gray:   'bg-slate-100 text-slate-600 border border-slate-200',
    orange: 'bg-orange-50 text-orange-700 border border-orange-100',
  };
  return (
    <span className={`badge ${colors[color] || colors.gray} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    present:     { label: 'Present',     color: 'green' },
    absent:      { label: 'Absent',      color: 'red' },
    'half-day':  { label: 'Half Day',    color: 'yellow' },
    late:        { label: 'Late',        color: 'orange' },
    pending:     { label: 'Pending',     color: 'yellow' },
    approved:    { label: 'Approved',    color: 'green' },
    rejected:    { label: 'Rejected',    color: 'red' },
    active:      { label: 'Active',      color: 'green' },
    completed:   { label: 'Completed',   color: 'blue' },
    'on-hold':   { label: 'On Hold',     color: 'yellow' },
    open:        { label: 'Open',        color: 'red' },
    in_progress: { label: 'In Progress', color: 'blue' },
    resolved:    { label: 'Resolved',    color: 'green' },
    todo:        { label: 'Todo',        color: 'gray' },
    review:      { label: 'Review',      color: 'purple' },
    low:         { label: 'Low',         color: 'gray' },
    medium:      { label: 'Medium',      color: 'yellow' },
    high:        { label: 'High',        color: 'red' },
  };
  const { label, color } = map[status] || { label: status, color: 'gray' };
  return <Badge color={color}>{label}</Badge>;
}
