import { useEffect, useState } from 'react';
import { Users, FolderKanban, Ticket, CalendarOff, Building2, CheckSquare, Clock, ArrowRight } from 'lucide-react';
import StatCard from '../../components/ui/StatCard.jsx';
import AttendanceWidget from '../../components/attendance/AttendanceWidget.jsx';
import BarChartWidget from '../../components/charts/BarChart.jsx';
import DonutChart from '../../components/charts/DonutChart.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/axios.js';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

export default function DashboardPage() {
  const { user } = useAuth();
  const isManagerPlus = ['super_admin', 'manager'].includes(user?.role);

  // Manager stats
  const [overview, setOverview]       = useState(null);
  const [attendance, setAttendance]   = useState([]);
  const [taskStats, setTaskStats]     = useState(null);
  const [ticketStats, setTicketStats] = useState(null);

  // Employee stats
  const [myTasks, setMyTasks] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [loadingEmployee, setLoadingEmployee] = useState(false);

  useEffect(() => {
    if (isManagerPlus) {
      api.get('/analytics/overview').then(r => setOverview(r.data)).catch(() => {});
      api.get('/analytics/attendance-summary').then(r => setAttendance(r.data)).catch(() => {});
      api.get('/analytics/task-completion').then(r => setTaskStats(r.data)).catch(() => {});
      api.get('/analytics/ticket-stats').then(r => setTicketStats(r.data)).catch(() => {});
    } else {
      setLoadingEmployee(true);
      Promise.all([
        api.get('/tasks/my'),
        api.get('/leaves/my'),
        api.get('/tickets/my')
      ]).then(([tasksRes, leavesRes, ticketsRes]) => {
        setMyTasks(tasksRes.data);
        setMyLeaves(leavesRes.data);
        setMyTickets(ticketsRes.data);
      }).catch(err => {
        console.error('Failed to load employee dashboard data', err);
      }).finally(() => {
        setLoadingEmployee(false);
      });
    }
  }, [isManagerPlus]);

  const taskDonutData = taskStats ? [
    { name: 'Todo',        value: taskStats.byStatus.todo },
    { name: 'In Progress', value: taskStats.byStatus.in_progress },
    { name: 'Review',      value: taskStats.byStatus.review },
    { name: 'Completed',   value: taskStats.byStatus.completed },
  ] : [];

  const ticketDonutData = ticketStats ? [
    { name: 'Open',        value: ticketStats.open },
    { name: 'In Progress', value: ticketStats.in_progress },
    { name: 'Resolved',    value: ticketStats.resolved },
  ] : [];

  // Employee calculated metrics
  const activeTasksCount = myTasks.filter(t => t.status !== 'completed').length;
  const completedTasksCount = myTasks.filter(t => t.status === 'completed').length;
  const pendingLeavesCount = myLeaves.filter(l => l.status === 'pending').length;
  const activeTicketsCount = myTickets.filter(t => t.status !== 'resolved').length;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-muted text-sm mt-0.5">Welcome back, {user?.name}</p>
        </div>
        <span className="text-sm text-muted capitalize bg-slate-100 px-3 py-1 rounded-full">{user?.role?.replace('_', ' ')}</span>
      </div>

      {/* Admin/Manager Statistics */}
      {isManagerPlus && overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={Users}       label="Total Employees"  value={overview.totalEmployees}  color="blue" />
          <StatCard icon={Building2}   label="Departments"      value={overview.totalDepartments} color="purple" />
          <StatCard icon={FolderKanban} label="Active Projects" value={overview.activeProjects}  color="green" />
          <StatCard icon={CalendarOff} label="Pending Leaves"   value={overview.pendingLeaves}   color="amber" />
        </div>
      )}

      {/* Employee Statistics */}
      {!isManagerPlus && !loadingEmployee && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={CheckSquare}  label="Active Tasks"     value={activeTasksCount}     color="blue" />
          <StatCard icon={FolderKanban} label="Completed Tasks"  value={completedTasksCount}  color="green" />
          <StatCard icon={CalendarOff}  label="Pending Leaves"   value={pendingLeavesCount}   color="amber" />
          <StatCard icon={Ticket}       label="Open Tickets"     value={activeTicketsCount}   color="purple" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Widget - Always visible for everyone */}
        <div className="lg:col-span-1 space-y-6">
          <AttendanceWidget />
          
          {/* Quick Shortcuts for Employees */}
          {!isManagerPlus && (
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link to="/leaves" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700">
                  <span className="flex items-center gap-2">
                    <CalendarOff size={16} className="text-amber-500" />
                    Request Leave
                  </span>
                  <ArrowRight size={14} className="text-slate-400" />
                </Link>
                <Link to="/tickets" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700">
                  <span className="flex items-center gap-2">
                    <Ticket size={16} className="text-purple-500" />
                    Open Support Ticket
                  </span>
                  <ArrowRight size={14} className="text-slate-400" />
                </Link>
                <Link to="/tasks" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700">
                  <span className="flex items-center gap-2">
                    <CheckSquare size={16} className="text-blue-500" />
                    View Task Board
                  </span>
                  <ArrowRight size={14} className="text-slate-400" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Second/Third column */}
        <div className="lg:col-span-2">
          {isManagerPlus ? (
            /* Manager Attendance Trend Chart */
            attendance.length > 0 && (
              <div className="card h-full">
                <h3 className="font-semibold text-slate-800 mb-4">Attendance Trend (Last 7 Days)</h3>
                <BarChartWidget data={attendance} xKey="date" barKey="present" color="#3B82F6" />
              </div>
            )
          ) : (
            /* Employee Assigned Tasks Overview */
            <div className="card h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">My Active Tasks</h3>
                <Link to="/tasks" className="text-xs text-accent font-semibold hover:underline">
                  Go to Kanban Board
                </Link>
              </div>
              
              {loadingEmployee ? (
                <div className="text-center py-12 text-muted text-sm">Loading tasks...</div>
              ) : myTasks.filter(t => t.status !== 'completed').length > 0 ? (
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px]">
                  {myTasks.filter(t => t.status !== 'completed').slice(0, 5).map(task => (
                    <div key={task._id} className="p-4 border rounded-xl hover:border-slate-300 transition-colors flex items-center justify-between bg-white">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-800 text-sm">{task.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                            {task.project?.title || 'No Project'}
                          </span>
                          <span>•</span>
                          <span>Due {dayjs(task.dueDate).format('MMM DD, YYYY')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
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
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 py-12 text-muted text-sm bg-slate-50 rounded-2xl border border-dashed">
                  <CheckSquare size={32} className="text-slate-400 mb-2" />
                  <p>All caught up! No active tasks assigned.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isManagerPlus && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {taskStats && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Task Overview</h3>
                <span className="text-sm text-muted">{taskStats.completionRate}% complete</span>
              </div>
              <DonutChart data={taskDonutData} nameKey="name" valueKey="value" />
            </div>
          )}
          {ticketStats && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Helpdesk Tickets</h3>
                <span className="text-sm text-muted">{ticketStats.total} total</span>
              </div>
              <DonutChart data={ticketDonutData} nameKey="name" valueKey="value" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
