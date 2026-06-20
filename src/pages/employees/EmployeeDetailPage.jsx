import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, UserX, Clock, Calendar, CheckSquare, BarChart3, Award, FileText, Info } from 'lucide-react';
import api from '../../api/axios.js';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(isBetween);
dayjs.extend(weekOfYear);

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('info'); // info, attendance, performance

  // Metrics states
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeFilter, setTimeFilter] = useState('month'); // week, month, year, all

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/users/${id}`),
      api.get(`/attendance/logs?employee=${id}`),
      api.get(`/tasks?assignedTo=${id}`)
    ])
      .then(([userRes, attRes, taskRes]) => {
        setEmployee(userRes.data);
        setAttendanceLogs(attRes.data);
        setTasks(taskRes.data);
      })
      .catch((e) => {
        console.error(e);
        toast.error('Failed to load employee details');
        navigate('/employees');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDeactivate = async () => {
    if (!confirm('Deactivate this employee?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Employee deactivated');
      navigate('/employees');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to deactivate employee');
    }
  };

  if (loading) return <div className="text-center py-16 text-muted">Loading employee files...</div>;
  if (!employee) return null;

  // Filter logic based on selected time filter (week, month, year, all)
  const filterByTime = (date) => {
    if (timeFilter === 'all') return true;
    const now = dayjs();
    const target = dayjs(date);
    
    if (timeFilter === 'week') {
      return target.week() === now.week() && target.year() === now.year();
    }
    if (timeFilter === 'month') {
      return target.month() === now.month() && target.year() === now.year();
    }
    if (timeFilter === 'year') {
      return target.year() === now.year();
    }
    return true;
  };

  // Filtered lists
  const filteredAttendance = attendanceLogs.filter(log => filterByTime(log.date));
  const filteredTasks = tasks.filter(task => filterByTime(task.createdAt));

  // Performance calculations
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress').length;
  const pendingTasks = filteredTasks.filter(t => t.status === 'todo').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Attendance metrics
  const totalPresentDays = filteredAttendance.filter(a => a.status === 'present').length;
  const totalWorkHours = filteredAttendance.reduce((acc, curr) => acc + (curr.workHours || 0), 0).toFixed(1);
  const averageWorkHours = totalPresentDays > 0 ? (totalWorkHours / totalPresentDays).toFixed(1) : 0;

  const basicInfo = [
    { label: 'Email Address',    value: employee.email },
    { label: 'Phone Number',     value: employee.phone || '—' },
    { label: 'Department',       value: employee.department?.name || '—' },
    { label: 'Designation',      value: employee.designation || '—' },
    { label: 'Date of Joining',  value: employee.dateOfJoining ? dayjs(employee.dateOfJoining).format('MMMM D, YYYY') : '—' },
    { label: 'System Access Role', value: employee.role.replace('_', ' ') },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/employees')} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="page-title flex-1">{employee.name}</h1>
        {employee.isActive && (
          <Button variant="danger" onClick={handleDeactivate}>
            <UserX size={16} /> Deactivate Account
          </Button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-blue-700 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-md">
              {employee.name[0].toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-800">{employee.name}</h2>
            <p className="text-muted text-sm mt-1">{employee.designation || 'Staff Member'}</p>
            <div className="flex justify-center gap-2 mt-4">
              <Badge color="blue" className="capitalize">{employee.role.replace('_', ' ')}</Badge>
              {employee.isActive ? (
                <Badge color="green">Active</Badge>
              ) : (
                <Badge color="red">Inactive</Badge>
              )}
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="card space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm border-b pb-2">Quick Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Task Complete Rate</span>
                <span className="font-semibold text-slate-800">{completionRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Present Days</span>
                <span className="font-semibold text-slate-800">{totalPresentDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Total Work Hours</span>
                <span className="font-semibold text-slate-800">{totalWorkHours}h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Tabs and Filterable Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Navigation Tabs & Time Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 p-2 rounded-2xl shadow-sm">
            <div className="flex gap-1 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'info' ? 'bg-accent text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Info size={16} /> Information
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'attendance' ? 'bg-accent text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Clock size={16} /> Attendance
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'performance' ? 'bg-accent text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <BarChart3 size={16} /> Performance
              </button>
            </div>

            {/* Time period filter controls (only for Attendance & Performance) */}
            {activeTab !== 'info' && (
              <div className="flex items-center gap-1.5 w-full sm:w-auto bg-slate-50 p-1 rounded-xl border">
                {['week', 'month', 'year', 'all'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                      timeFilter === filter ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {filter === 'all' ? 'All Time' : `This ${filter}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Content */}
          {activeTab === 'info' && (
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
                <FileText size={18} className="text-accent" />
                Employee Profile Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                {basicInfo.map(({ label, value }) => (
                  <div key={label} className="border-b border-slate-50 pb-3">
                    <p className="text-xs text-muted font-semibold uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-medium text-slate-800 mt-1 capitalize">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6">
              {/* Attendance quick stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <span className="text-muted text-xs block">Days Logged</span>
                    <span className="font-bold text-slate-800 text-lg">{totalPresentDays} Days</span>
                  </div>
                </div>
                <div className="card bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                  <div>
                    <span className="text-muted text-xs block">Total Hours Work</span>
                    <span className="font-bold text-slate-800 text-lg">{totalWorkHours} Hrs</span>
                  </div>
                </div>
                <div className="card bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center">
                    <Award size={20} />
                  </div>
                  <div>
                    <span className="text-muted text-xs block">Avg. Hours/Day</span>
                    <span className="font-bold text-slate-800 text-lg">{averageWorkHours} Hrs</span>
                  </div>
                </div>
              </div>

              {/* Attendance Table */}
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Work Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendance.map(log => (
                      <tr key={log._id}>
                        <td>{dayjs(log.date).format('MMMM DD, YYYY')}</td>
                        <td>{log.checkIn ? dayjs(log.checkIn).format('hh:mm A') : '—'}</td>
                        <td>{log.checkOut ? dayjs(log.checkOut).format('hh:mm A') : '—'}</td>
                        <td>{log.workHours ? `${log.workHours} hrs` : '—'}</td>
                        <td><StatusBadge status={log.status} /></td>
                      </tr>
                    ))}
                    {!filteredAttendance.length && (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-muted">
                          No attendance logs found for this timeframe.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              {/* Performance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="card flex flex-col justify-between p-4 bg-emerald-50/50 border-emerald-100">
                  <span className="text-muted text-xs">Completion Rate</span>
                  <span className="font-extrabold text-2xl text-emerald-600 mt-2">{completionRate}%</span>
                </div>
                <div className="card flex flex-col justify-between p-4 bg-blue-50/50 border-blue-100">
                  <span className="text-muted text-xs">Completed Tasks</span>
                  <span className="font-extrabold text-2xl text-blue-600 mt-2">{completedTasks}</span>
                </div>
                <div className="card flex flex-col justify-between p-4 bg-amber-50/50 border-amber-100">
                  <span className="text-muted text-xs">In Progress</span>
                  <span className="font-extrabold text-2xl text-amber-600 mt-2">{inProgressTasks}</span>
                </div>
                <div className="card flex flex-col justify-between p-4 bg-slate-50 border-slate-200">
                  <span className="text-muted text-xs">Total Assigned</span>
                  <span className="font-extrabold text-2xl text-slate-700 mt-2">{totalTasks}</span>
                </div>
              </div>

              {/* Tasks List */}
              <div className="card">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <CheckSquare size={18} className="text-accent" />
                  Assigned Kanban Tasks
                </h3>
                <div className="space-y-3">
                  {filteredTasks.map(task => (
                    <div key={task._id} className="p-4 border rounded-xl flex items-center justify-between bg-white">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{task.title}</p>
                        <p className="text-xs text-muted mt-1">
                          Project: <span className="font-medium">{task.project?.title || 'None'}</span> • Created {dayjs(task.createdAt).format('MMM DD, YYYY')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`capitalize text-xs px-2 py-0.5 rounded border ${
                          task.priority === 'high' ? 'bg-red-50 text-red-600 border-red-200' :
                          task.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                          'bg-blue-50 text-blue-600 border-blue-200'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="capitalize text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                  {!filteredTasks.length && (
                    <div className="text-center py-12 text-muted text-sm">
                      No tasks logged during this timeframe.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
