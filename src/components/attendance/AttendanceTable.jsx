import dayjs from 'dayjs';
import { StatusBadge } from '../ui/Badge.jsx';

export default function AttendanceTable({ records = [] }) {
  if (!records.length) {
    return <div className="text-center py-12 text-muted">No attendance records found.</div>;
  }
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Hours</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r._id}>
              <td className="font-medium">{dayjs(r.date).format('MMM D, YYYY')}</td>
              <td>{r.checkIn  ? dayjs(r.checkIn).format('hh:mm A')  : '—'}</td>
              <td>{r.checkOut ? dayjs(r.checkOut).format('hh:mm A') : '—'}</td>
              <td>{r.workHours ? `${r.workHours}h` : '—'}</td>
              <td><StatusBadge status={r.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
