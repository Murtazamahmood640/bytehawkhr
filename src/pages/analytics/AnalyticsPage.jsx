import { useEffect, useState } from 'react';
import { BarChart3, Users, Building2, FolderKanban, CalendarOff, Ticket } from 'lucide-react';
import api from '../../api/axios.js';
import StatCard from '../../components/ui/StatCard.jsx';
import BarChartWidget from '../../components/charts/BarChart.jsx';
import DonutChart from '../../components/charts/DonutChart.jsx';

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [taskStats, setTaskStats] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [ticketStats, setTicketStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [overviewRes, taskRes, attendanceRes, ticketRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/task-completion'),
        api.get('/analytics/attendance-summary'),
        api.get('/analytics/ticket-stats'),
      ]);
      setOverview(overviewRes.data);
      setTaskStats(taskRes.data);
      setAttendance(attendanceRes.data);
      setTicketStats(ticketRes.data);
    } catch (e) {
      console.error('Failed to load analytics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const taskDonutData = taskStats ? [
    { name: 'Todo', value: taskStats.byStatus?.todo || 0 },
    { name: 'In Progress', value: taskStats.byStatus?.in_progress || 0 },
    { name: 'Review', value: taskStats.byStatus?.review || 0 },
    { name: 'Completed', value: taskStats.byStatus?.completed || 0 },
  ] : [];

  const ticketDonutData = ticketStats ? [
    { name: 'Open', value: ticketStats.open || 0 },
    { name: 'In Progress', value: ticketStats.in_progress || 0 },
    { name: 'Resolved', value: ticketStats.resolved || 0 },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <BarChart3 size={24} className="text-accent" />
          <h1 className="page-title">Company Analytics</h1>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted">Loading Analytics...</div>
      ) : (
        <>
          {overview && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Total Employees" value={overview.totalEmployees} color="blue" />
              <StatCard icon={Building2} label="Departments" value={overview.totalDepartments} color="purple" />
              <StatCard icon={FolderKanban} label="Active Projects" value={overview.activeProjects} color="green" />
              <StatCard icon={CalendarOff} label="Pending Leaves" value={overview.pendingLeaves} color="amber" />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Attendance Chart */}
            <div className="card lg:col-span-2">
              <h3 className="font-semibold text-slate-800 mb-4">Daily Attendance Summary (Present Count)</h3>
              {attendance.length > 0 ? (
                <BarChartWidget data={attendance} xKey="date" barKey="present" color="#3B82F6" />
              ) : (
                <div className="h-[220px] flex items-center justify-center text-muted text-sm">
                  No attendance data available.
                </div>
              )}
            </div>

            {/* Ticket Distribution */}
            <div className="card lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Support Ticket Status</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {ticketStats?.total || 0} Total
                </span>
              </div>
              {ticketStats && ticketStats.total > 0 ? (
                <DonutChart data={ticketDonutData} nameKey="name" valueKey="value" />
              ) : (
                <div className="h-[220px] flex items-center justify-center text-muted text-sm">
                  No tickets logged yet.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Stats Card */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Kanban Tasks Distribution</h3>
                {taskStats && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {taskStats.completionRate}% Completion Rate
                  </span>
                )}
              </div>
              {taskStats ? (
                <DonutChart data={taskDonutData} nameKey="name" valueKey="value" />
              ) : (
                <div className="h-[220px] flex items-center justify-center text-muted text-sm">
                  No task data available.
                </div>
              )}
            </div>

            {/* HR Health Checklist */}
            <div className="card flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 mb-4">System Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Database Connection</span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Healthy
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Pending Approvals Checklist</span>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      {overview?.pendingLeaves || 0} Leaves
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">Active Service Desk</span>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                      {(ticketStats?.open || 0) + (ticketStats?.in_progress || 0)} In-flight Tickets
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
