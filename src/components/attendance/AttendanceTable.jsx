import dayjs from 'dayjs';
import { StatusBadge } from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import { Edit2 } from 'lucide-react';

export default function AttendanceTable({ records = [], isManagerPlus = false, onEdit }) {
  if (!records.length) {
    return <div className="text-center py-12 text-muted">No attendance records found.</div>;
  }
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {isManagerPlus && <th>Employee</th>}
            <th>Date</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Hours</th>
            <th>Status</th>
            {isManagerPlus && onEdit && <th className="text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r._id}>
              {isManagerPlus && <td className="font-semibold text-slate-700">{r.employee?.name || '—'}</td>}
              <td className="font-medium">{dayjs(r.date).format('MMM D, YYYY')}</td>
              <td>{r.checkIn  ? dayjs(r.checkIn).format('hh:mm A')  : '—'}</td>
              <td>{r.checkOut ? dayjs(r.checkOut).format('hh:mm A') : '—'}</td>
              <td>{r.workHours ? `${r.workHours}h` : '—'}</td>
              <td><StatusBadge status={r.status} /></td>
              {isManagerPlus && onEdit && (
                <td className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => onEdit(r)}>
                    <Edit2 size={14} className="text-slate-500 hover:text-accent" />
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
