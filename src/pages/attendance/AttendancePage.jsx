import { useEffect, useState } from 'react';
import { Clock, Calendar, List, Plus, Trash2, CalendarDays, Award, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import AttendanceWidget from '../../components/attendance/AttendanceWidget.jsx';
import AttendanceTable from '../../components/attendance/AttendanceTable.jsx';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

export default function AttendancePage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const isManagerPlus = ['super_admin', 'manager'].includes(user?.role);

  const [records, setRecords] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('calendar'); // calendar or table
  
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('me'); // 'me', 'all', or employeeId
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Date tracking for Calendar view
  const [currentDate, setCurrentDate] = useState(dayjs());
  
  // Modals
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showAddHoliday, setShowAddHoliday] = useState(false);
  
  // New holiday form
  const [holidayTitle, setHolidayTitle] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayDesc, setHolidayDesc] = useState('');
  const [submittingHoliday, setSubmittingHoliday] = useState(false);

  const fetchEmployees = async () => {
    if (!isManagerPlus) return;
    try {
      const { data } = await api.get('/users?role=employee');
      setEmployees(data.users ?? data);
    } catch {}
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      let attendanceEndpoint = '/attendance/my';
      let leavesEndpoint = '/leaves/my';

      if (isManagerPlus) {
        if (selectedEmployee === 'all') {
          attendanceEndpoint = '/attendance/logs';
          leavesEndpoint = '/leaves';
        } else if (selectedEmployee !== 'me') {
          attendanceEndpoint = `/attendance/logs?employee=${selectedEmployee}`;
          leavesEndpoint = `/leaves?employee=${selectedEmployee}`;
        }
      }

      if (viewMode === 'table') {
        const joinCharAtt = attendanceEndpoint.includes('?') ? '&' : '?';
        const joinCharLev = leavesEndpoint.includes('?') ? '&' : '?';
        if (startDate) {
          attendanceEndpoint += `${joinCharAtt}startDate=${startDate}`;
          leavesEndpoint += `${joinCharLev}startDate=${startDate}`;
        }
        if (endDate) {
          attendanceEndpoint += `${attendanceEndpoint.includes('?') ? '&' : '?'}endDate=${endDate}`;
          leavesEndpoint += `${leavesEndpoint.includes('?') ? '&' : '?'}endDate=${endDate}`;
        }
      }

      const [attRes, leavesRes, holidaysRes] = await Promise.all([
        api.get(attendanceEndpoint),
        api.get(leavesEndpoint),
        api.get('/holidays')
      ]);

      setRecords(attRes.data);
      setLeaves(leavesRes.data.filter(l => l.status === 'approved'));
      setHolidays(holidaysRes.data);
    } catch (e) {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedEmployee, viewMode]); // Refetch when employee or viewMode changes

  const downloadExcel = () => {
    if (!records.length) return toast.error('No records to export');
    const data = records.map(r => ({
      Employee: r.employee?.name || user?.name || 'Unknown',
      Date: dayjs(r.date).format('YYYY-MM-DD'),
      'Check In': r.checkIn ? dayjs(r.checkIn).format('hh:mm A') : '-',
      'Check Out': r.checkOut ? dayjs(r.checkOut).format('hh:mm A') : '-',
      'Work Hours': r.workHours || 0,
      Status: r.status,
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
    XLSX.writeFile(wb, `Attendance_Report_${dayjs().format('YYYYMMDD')}.xlsx`);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!holidayTitle || !holidayDate) return toast.error('Title and Date are required');
    try {
      setSubmittingHoliday(true);
      await api.post('/holidays', {
        title: holidayTitle,
        date: holidayDate,
        description: holidayDesc
      });
      toast.success('Holiday added successfully');
      setHolidayTitle('');
      setHolidayDate('');
      setHolidayDesc('');
      setShowAddHoliday(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add holiday');
    } finally {
      setSubmittingHoliday(false);
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm('Delete this holiday?')) return;
    try {
      await api.delete(`/holidays/${id}`);
      toast.success('Holiday deleted successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete holiday');
    }
  };

  // Calendar logic helpers
  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const daysInMonth = currentDate.daysInMonth();
  
  const startDayOfWeek = startOfMonth.day(); // 0 is Sunday, 6 is Saturday
  
  const calendarCells = [];
  
  // Fill preceding empty cells (from previous month)
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null);
  }
  
  // Fill calendar days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(currentDate.date(d));
  }

  const prevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));
  const nextMonth = () => setCurrentDate(currentDate.add(1, 'month'));

  // Get data matching specific date
  const getDayData = (date) => {
    if (!date) return { log: null, holiday: null, leave: null };
    const dateStr = date.format('YYYY-MM-DD');
    
    // Find attendance log
    const log = records.find(r => dayjs(r.date).format('YYYY-MM-DD') === dateStr);
    
    // Find holiday
    const holiday = holidays.find(h => dayjs(h.date).format('YYYY-MM-DD') === dateStr);
    
    // Find approved leave
    const leave = leaves.find(l => {
      const start = dayjs(l.startDate).startOf('day');
      const end = dayjs(l.endDate).endOf('day');
      return date.isBetween(start, end, null, '[]');
    });

    return { log, holiday, leave };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Clock size={24} className="text-accent" />
          <h1 className="page-title">Attendance & Calendar</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <Button variant="secondary" onClick={() => setShowHolidayModal(true)}>
              <CalendarDays size={16} /> Manage Holidays
            </Button>
          )}

          {isManagerPlus && (
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-white text-slate-700"
            >
              <option value="me">My Calendar</option>
              <option value="all">All Employees</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
          )}
          
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'calendar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Calendar size={14} /> Calendar
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List size={14} /> Table View
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Attendance actions widget */}
        <div className="lg:col-span-1">
          <AttendanceWidget onRefresh={fetchData} />
        </div>

        {/* Right Column: Calendar or Table */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-16 text-muted">Loading logs...</div>
          ) : viewMode === 'table' ? (
            <div className="space-y-4">
              <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <input type="date" className="input py-1.5" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  <span className="text-sm text-slate-500 font-medium">to</span>
                  <input type="date" className="input py-1.5" value={endDate} onChange={e => setEndDate(e.target.value)} />
                  <Button size="sm" onClick={fetchData}>Apply Filter</Button>
                  {(startDate || endDate) && (
                    <Button size="sm" variant="ghost" onClick={() => { setStartDate(''); setEndDate(''); setTimeout(fetchData, 0); }}>Clear</Button>
                  )}
                </div>
                <Button variant="secondary" size="sm" onClick={downloadExcel}>
                  <Download size={14} /> Export to Excel
                </Button>
              </div>
              <AttendanceTable records={records} />
            </div>
          ) : (
            /* Premium Monthly Calendar Grid */
            <div className="card space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="font-bold text-lg text-slate-800">
                  {currentDate.format('MMMM YYYY')}
                </h3>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={prevMonth}>Previous</Button>
                  <Button size="sm" variant="ghost" onClick={nextMonth}>Next</Button>
                </div>
              </div>

              {/* Days of week headers */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="py-2">{d}</div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarCells.map((date, idx) => {
                  if (!date) return <div key={`empty-${idx}`} className="bg-slate-50/50 rounded-xl min-h-[90px] border border-slate-100/50" />;
                  
                  const { log, holiday, leave } = getDayData(date);
                  const isToday = date.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');

                  return (
                    <div
                      key={date.format('DD')}
                      className={`min-h-[90px] p-2 border rounded-xl flex flex-col justify-between transition-colors bg-white hover:bg-slate-50 ${
                        isToday ? 'ring-2 ring-accent border-transparent' : 'border-slate-100'
                      }`}
                    >
                      {/* Day Number */}
                      <span className={`text-xs font-bold ${isToday ? 'text-accent' : 'text-slate-600'}`}>
                        {date.format('D')}
                      </span>

                      {/* Display events on the day */}
                      <div className="space-y-1 mt-2">
                        {/* Attendance Log status */}
                        {log && (
                          <div className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border flex flex-col ${
                            log.status === 'half-day' 
                              ? 'bg-amber-50 border-amber-200 text-amber-700' 
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          }`}>
                            <span className="capitalize">{log.status.replace('-', ' ')}</span>
                            {log.workHours > 0 && <span className="font-normal text-[8px] text-slate-500">{log.workHours}h (In: {dayjs(log.checkIn).format('h:mm A')})</span>}
                          </div>
                        )}

                        {/* Holiday Banner */}
                        {holiday && (
                          <div className="text-[10px] px-1.5 py-0.5 rounded font-semibold border bg-indigo-50 border-indigo-200 text-indigo-700 truncate" title={holiday.title}>
                            🎉 {holiday.title}
                          </div>
                        )}

                        {/* Leave Banner */}
                        {leave && (
                          <div className="text-[10px] px-1.5 py-0.5 rounded font-semibold border bg-purple-50 border-purple-200 text-purple-700 truncate" title={`${leave.employee?.name ? `${leave.employee.name}'s ` : ''}${leave.type} leave`}>
                            🤒 {leave.type} Leave
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Holiday Management Modal */}
      <Modal open={showHolidayModal} onClose={() => setShowHolidayModal(false)} title="Manage Corporate Holidays" size="lg">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-sm font-semibold text-slate-700">Upcoming Holidays</span>
            {!showAddHoliday && (
              <Button size="sm" onClick={() => setShowAddHoliday(true)}>
                <Plus size={14} /> Add Holiday
              </Button>
            )}
          </div>

          {showAddHoliday && (
            <form onSubmit={handleAddHoliday} className="p-4 border rounded-xl bg-slate-50 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase">New Calendar Holiday</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Holiday Title *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. New Year, Independence Day"
                    value={holidayTitle}
                    onChange={e => setHolidayTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Date *</label>
                  <input
                    type="date"
                    className="input"
                    value={holidayDate}
                    onChange={e => setHolidayDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Description / Note</label>
                <textarea
                  className="input resize-none"
                  rows={2}
                  placeholder="Optional details..."
                  value={holidayDesc}
                  onChange={e => setHolidayDesc(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={() => setShowAddHoliday(false)}>Cancel</Button>
                <Button type="submit" size="sm" loading={submittingHoliday}>Add Holiday</Button>
              </div>
            </form>
          )}

          <div className="table-container max-h-[300px] overflow-y-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Holiday</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map(h => (
                  <tr key={h._id}>
                    <td className="font-semibold text-slate-800">{h.title}</td>
                    <td>{dayjs(h.date).format('MMMM DD, YYYY')}</td>
                    <td><p className="text-xs text-slate-500 max-w-xs truncate">{h.description || '—'}</p></td>
                    <td className="text-right">
                      <Button size="sm" variant="danger" onClick={() => handleDeleteHoliday(h._id)}>
                        <Trash2 size={12} />
                      </Button>
                    </td>
                  </tr>
                ))}
                {!holidays.length && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-muted text-xs">
                      No corporate holidays configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
}
