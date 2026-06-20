import { useEffect, useState } from 'react';
import { Clock, LogIn, LogOut } from 'lucide-react';
import Button from '../ui/Button.jsx';
import { useAttendance } from '../../hooks/useAttendance.js';
import dayjs from 'dayjs';

export default function AttendanceWidget() {
  const { today, loading, fetchToday, checkIn, checkOut } = useAttendance();
  const [time, setTime] = useState(new Date());

  useEffect(() => { fetchToday(); }, [fetchToday]);
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hasCheckedIn  = Boolean(today?.checkIn);
  const hasCheckedOut = Boolean(today?.checkOut);

  return (
    <div className="card bg-gradient-to-br from-primary to-blue-700 text-white border-0">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={18} className="text-blue-200" />
        <span className="text-blue-200 text-sm font-medium">Today's Attendance</span>
      </div>

      <div className="text-4xl font-bold tracking-tight mb-1">
        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      <div className="text-blue-300 text-sm mb-6">
        {dayjs().format('dddd, MMMM D')}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-blue-200 text-xs mb-1">Check In</p>
          <p className="text-white font-semibold text-sm">
            {today?.checkIn ? dayjs(today.checkIn).format('hh:mm A') : '—'}
          </p>
        </div>
        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-blue-200 text-xs mb-1">Check Out</p>
          <p className="text-white font-semibold text-sm">
            {today?.checkOut ? dayjs(today.checkOut).format('hh:mm A') : '—'}
          </p>
        </div>
        {hasCheckedIn && hasCheckedOut && (
          <div className="bg-white/10 rounded-xl p-3 col-span-2">
            <p className="text-blue-200 text-xs mb-1">Work Hours</p>
            <p className="text-white font-semibold">{today.workHours}h</p>
          </div>
        )}
      </div>

      {!hasCheckedIn && (
        <Button onClick={checkIn} loading={loading} className="w-full bg-white text-primary hover:bg-blue-50 border-0">
          <LogIn size={16} /> Check In
        </Button>
      )}
      {hasCheckedIn && !hasCheckedOut && (
        <Button onClick={checkOut} loading={loading} className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
          <LogOut size={16} /> Check Out
        </Button>
      )}
      {hasCheckedIn && hasCheckedOut && (
        <div className="text-center text-blue-200 text-sm py-2">✓ Attendance recorded</div>
      )}
    </div>
  );
}
