import { useState } from 'react';
import TaskCard from './TaskCard.jsx';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       color: 'bg-slate-400' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { id: 'review',      label: 'Review',      color: 'bg-purple-500' },
  { id: 'completed',   label: 'Completed',   color: 'bg-emerald-500' },
];

export default function KanbanBoard({ tasks = [], onTaskClick, onRefresh }) {
  const [dragging, setDragging] = useState(null);

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id);
    return acc;
  }, {});

  const handleDrop = async (colId) => {
    if (!dragging || dragging.status === colId) { setDragging(null); return; }
    try {
      await api.put(`/tasks/${dragging._id}`, { status: colId });
      toast.success('Task status updated');
      onRefresh?.();
    } catch {
      toast.error('Failed to update task');
    }
    setDragging(null);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {COLUMNS.map((col) => (
        <div
          key={col.id}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(col.id)}
          className="bg-slate-50 rounded-2xl p-4 min-h-[400px]"
        >
          {/* Column Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
            <h3 className="text-sm font-semibold text-slate-700">{col.label}</h3>
            <span className="ml-auto bg-white text-xs text-muted px-2 py-0.5 rounded-full border border-slate-200">
              {grouped[col.id]?.length || 0}
            </span>
          </div>

          {/* Task Cards */}
          <div className="space-y-3">
            {(grouped[col.id] || []).map((task) => (
              <div
                key={task._id}
                draggable
                onDragStart={() => setDragging(task)}
                onDragEnd={() => setDragging(null)}
                className={`transition-opacity ${dragging?._id === task._id ? 'opacity-50' : 'opacity-100'}`}
              >
                <TaskCard task={task} onClick={onTaskClick} />
              </div>
            ))}
            {!(grouped[col.id]?.length) && (
              <div className="text-center text-xs text-slate-300 py-8">Drop tasks here</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
