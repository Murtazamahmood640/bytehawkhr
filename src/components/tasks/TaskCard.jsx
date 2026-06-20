import { Calendar, Flag } from 'lucide-react';
import { StatusBadge } from '../ui/Badge.jsx';
import dayjs from 'dayjs';

const priorityColors = { high: 'text-red-500', medium: 'text-amber-500', low: 'text-slate-400' };

export default function TaskCard({ task, onClick }) {
  return (
    <div
      onClick={() => onClick?.(task)}
      className="bg-white border border-slate-100 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-accent/30 transition-all duration-200 animate-slide-up group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-semibold text-slate-800 group-hover:text-accent transition-colors line-clamp-2">
          {task.title}
        </h4>
        <Flag size={14} className={`shrink-0 mt-0.5 ${priorityColors[task.priority]}`} />
      </div>

      {task.description && (
        <p className="text-xs text-muted line-clamp-2 mb-3">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <StatusBadge status={task.status} />
        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-muted">
            <Calendar size={11} />
            {dayjs(task.dueDate).format('MMM D')}
          </div>
        )}
      </div>

      {task.assignedTo && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50">
          <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-semibold">
            {task.assignedTo.name?.[0]}
          </div>
          <span className="text-xs text-muted">{task.assignedTo.name}</span>
        </div>
      )}
    </div>
  );
}
