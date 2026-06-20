import { useEffect, useState, useCallback } from 'react';
import {
  CalendarDays, Plus, CheckCircle2, XCircle, Clock,
  ChevronLeft, ChevronRight, Pencil, Save, BarChart3, FileText, Users
} from 'lucide-react';
import dayjs from 'dayjs';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'react-hot-toast';

/* ── helpers ─────────────────────────────────────────────── */
const TYPE_META = {
  annual:    { bg: 'bg-indigo-100 text-indigo-700',   dot: 'bg-indigo-500'  },
  sick:      { bg: 'bg-red-100 text-red-700',         dot: 'bg-red-500'     },
  emergency: { bg: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-500'   },
  other:     { bg: 'bg-teal-100 text-teal-700',       dot: 'bg-teal-500'    },
};
const STATUS_META = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

const TypeBadge = ({ t }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${TYPE_META[t]?.bg || 'bg-slate-100 text-slate-600'}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${TYPE_META[t]?.dot || 'bg-slate-400'}`}></span>
    {t}
  </span>
);
const StatusBadge = ({ s }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_META[s] || 'bg-slate-100 text-slate-600'}`}>{s}</span>
);

/* ── Quota bar ───────────────────────────────────────────── */
const QuotaBar = ({ label, used, total, color }) => {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  return (
    <div className="flex-1 min-w-[160px]">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-xs text-slate-500">{used} / {total} days</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

/* ── Mini calendar ───────────────────────────────────────── */
const CAL_COLORS = {
  annual: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  sick:   { bg: 'bg-red-100',    text: 'text-red-700'    },
  emergency: { bg: 'bg-amber-100', text: 'text-amber-700' },
  other:  { bg: 'bg-teal-100',   text: 'text-teal-700'  },
};

const LeaveCalendar = ({ leaves }) => {
  const [month, setMonth] = useState(dayjs());
  const startDay   = month.startOf('month').day();
  const daysInMonth = month.daysInMonth();
  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const markedDays = {};
  for (const l of leaves) {
    if (!['approved','pending'].includes(l.status)) continue;
    let cur = dayjs(l.startDate);
    const end = dayjs(l.endDate);
    while (cur.isBefore(end) || cur.isSame(end,'day')) {
      if (cur.month() === month.month() && cur.year() === month.year())
        markedDays[cur.date()] = l;
      cur = cur.add(1,'day');
    }
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setMonth(m => m.subtract(1,'month'))}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
          <ChevronLeft size={16} className="text-slate-500" />
        </button>
        <span className="font-bold text-slate-800">{month.format('MMMM YYYY')}</span>
        <button onClick={() => setMonth(m => m.add(1,'month'))}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
          <ChevronRight size={16} className="text-slate-500" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="text-[11px] font-bold text-slate-400 pb-2">{d}</div>
        ))}
        {cells.map((d, i) => {
          const mark = d && markedDays[d];
          const isToday = d && month.date(d).isSame(dayjs(),'day');
          const cc = mark ? CAL_COLORS[mark.type] : null;
          return (
            <div key={i} title={mark ? `${mark.type} (${mark.status})` : undefined}
              className={`h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-150
                ${mark ? `${cc.bg} ${cc.text} cursor-help` : ''}
                ${isToday && !mark ? 'bg-indigo-50 text-indigo-600 font-bold ring-1 ring-indigo-200' : ''}
                ${!mark && !isToday ? 'text-slate-700 hover:bg-slate-50' : ''}`}>
              {d ?? ''}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-6 flex-wrap">
        {Object.entries(TYPE_META).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className={`w-2.5 h-2.5 rounded-sm ${v.dot}`}></span>
            <span className="capitalize">{k}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Quota editor ────────────────────────────────────────── */
const QuotaEditor = ({ emp, onSave }) => {
  const [q, setQ] = useState({
    annual: emp.leaveQuota?.annual ?? 15,
    sick: emp.leaveQuota?.sick ?? 10,
    emergency: emp.leaveQuota?.emergency ?? 5
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/leaves/quota/${emp._id}`, q);
      toast.success(`Quota updated for ${emp.name}`);
      onSave?.();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {['annual','sick','emergency'].map(t => (
        <div key={t} className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 capitalize">{t}</span>
          <input type="number" min={0} max={60} value={q[t]}
            onChange={e => setQ(p => ({ ...p, [t]: Number(e.target.value) }))}
            className="w-14 px-2 py-1 rounded-lg border border-slate-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      ))}
      <button onClick={save} disabled={saving}
        className="btn btn-primary btn-sm flex items-center gap-1 px-3 py-1 text-xs rounded-lg bg-accent text-white hover:bg-blue-600 transition-colors">
        <Save size={12} /> {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════ */
export default function LeavePage() {
  const { user } = useAuth();
  const isManagerPlus = ['super_admin', 'manager'].includes(user?.role);

  const [tab,       setTab]       = useState('list');
  const [leaves,    setLeaves]    = useState([]);
  const [quota,     setQuota]     = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const [showModal,    setShowModal]    = useState(false);
  const [reviewing,    setReviewing]    = useState(null);
  const [reviewNote,   setReviewNote]   = useState('');
  const [editQuotaFor, setEditQuotaFor] = useState(null);

  const [selectedEmployee, setSelectedEmployee] = useState('all');

  const [form, setForm] = useState({ type:'annual', startDate:'', endDate:'', reason:'' });

  /* ── fetch ────────────────────────────────────────── */
  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const ep = isManagerPlus ? '/leaves' : '/leaves/my';
      const { data } = await api.get(ep);
      setLeaves(data);
    } catch {} finally { setLoading(false); }
  }, [isManagerPlus]);

  const fetchQuota = useCallback(async () => {
    try { const { data } = await api.get('/leaves/my-quota'); setQuota(data); } catch {}
  }, []);

  const fetchEmployees = useCallback(async () => {
    if (!isManagerPlus) return;
    try { const { data } = await api.get('/users?role=employee'); setEmployees(data.users ?? data); } catch {}
  }, [isManagerPlus]);

  useEffect(() => { fetchLeaves(); fetchQuota(); fetchEmployees(); }, []);

  /* ── submit ───────────────────────────────────────── */
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/leaves', form);
      toast.success('Leave request submitted');
      setShowModal(false);
      setForm({ type:'annual', startDate:'', endDate:'', reason:'' });
      fetchLeaves(); fetchQuota();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  /* ── review ───────────────────────────────────────── */
  const handleReview = async status => {
    try {
      await api.put(`/leaves/${reviewing._id}/review`, { status, reviewNote });
      toast.success(`Leave ${status}`);
      setReviewing(null); setReviewNote('');
      fetchLeaves();
      if (isManagerPlus) fetchEmployees(); // Sync quota table
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
  };

  /* ── render ───────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <CalendarDays size={20} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="page-title">{isManagerPlus ? 'Leave Management' : 'My Leaves'}</h1>
            <p className="text-sm text-slate-500">{isManagerPlus ? 'Review and manage team leave requests' : 'Track your leave requests and quotas'}</p>
          </div>
        </div>
        {!isManagerPlus && (
          <button onClick={() => setShowModal(true)} id="request-leave-btn"
            className="btn btn-primary flex items-center gap-2">
            <Plus size={16} /> Request Leave
          </button>
        )}
      </div>

      {/* ── Quota cards ── */}
      {quota && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label:'Annual Leave',    used: quota.used.annual,    total: quota.quota.annual,    remaining: quota.remaining.annual,    bar:'bg-indigo-500', iconBg:'bg-indigo-100', icon:'text-indigo-600' },
            { label:'Sick Leave',      used: quota.used.sick,      total: quota.quota.sick,      remaining: quota.remaining.sick,      bar:'bg-red-500',    iconBg:'bg-red-100',    icon:'text-red-600'    },
            { label:'Emergency Leave', used: quota.used.emergency, total: quota.quota.emergency, remaining: quota.remaining.emergency, bar:'bg-amber-500',  iconBg:'bg-amber-100',  icon:'text-amber-600'  },
          ].map(q => (
            <div key={q.label} className="card p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl ${q.iconBg} flex items-center justify-center`}>
                  <CalendarDays size={18} className={q.icon} />
                </div>
                <span className="text-3xl font-black text-slate-800">{q.remaining}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">{q.label}</p>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${q.bar} transition-all duration-500`}
                    style={{ width: q.total > 0 ? `${Math.min(100,(q.used/q.total)*100)}%` : '0%' }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{q.used} used · {q.total} total</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          {[
            { id:'list',     icon: FileText,     label:'Requests'       },
            { id:'calendar', icon: CalendarDays, label:'Calendar'       },
            ...(isManagerPlus ? [{ id:'quota', icon: Users, label:'Manage Quotas' }] : []),
          ].map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                ${tab === id ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Icon size={15} />{label}
            </button>
          ))}
        </div>
        
        {/* Employee Filter for Calendar/List */}
        {isManagerPlus && tab !== 'quota' && (
          <select
            value={selectedEmployee}
            onChange={e => setSelectedEmployee(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-white text-slate-700"
          >
            <option value="all">All Employees</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>{emp.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* ── Calendar tab ── */}
      {tab === 'calendar' && (
        <LeaveCalendar leaves={selectedEmployee === 'all' ? leaves : leaves.filter(l => l.employee?._id === selectedEmployee)} />
      )}

      {/* ── Quota mgmt tab ── */}
      {tab === 'quota' && isManagerPlus && (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Users size={18} className="text-accent" />
            <span className="font-bold text-slate-800">Employee Leave Quotas</span>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  {['Employee','Department','Annual','Sick','Emergency','Actions'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp._id}>
                    <td>
                      <p className="font-semibold text-slate-800">{emp.name}</p>
                      <p className="text-xs text-slate-400">{emp.email}</p>
                    </td>
                    <td className="text-slate-500">{emp.department?.name ?? '—'}</td>
                    <td><span className="font-bold text-indigo-600">{emp.leaveQuota?.annual ?? 15}</span></td>
                    <td><span className="font-bold text-red-500">{emp.leaveQuota?.sick ?? 10}</span></td>
                    <td><span className="font-bold text-amber-500">{emp.leaveQuota?.emergency ?? 5}</span></td>
                    <td>
                      {editQuotaFor === emp._id
                        ? <QuotaEditor emp={emp} onSave={() => { setEditQuotaFor(null); fetchEmployees(); }} />
                        : <button onClick={() => setEditQuotaFor(emp._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                            <Pencil size={12} /> Edit
                          </button>
                      }
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-400">No employees found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Requests list ── */}
      {tab === 'list' && (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <FileText size={18} className="text-accent" />
            <span className="font-bold text-slate-800">
              {isManagerPlus ? 'All Leave Requests' : 'My Requests'}
            </span>
          </div>
          {loading ? (
            <div className="py-16 text-center text-slate-400">Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    {isManagerPlus && <th>Employee</th>}
                    <th>Type</th><th>From</th><th>To</th><th>Days</th>
                    <th>Reason</th><th>Status</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves
                    .filter(l => selectedEmployee === 'all' || l.employee?._id === selectedEmployee)
                    .map(l => {
                    const days = Math.max(1, dayjs(l.endDate).diff(dayjs(l.startDate),'day') + 1);
                    return (
                      <tr key={l._id}>
                        {isManagerPlus && (
                          <td>
                            <p className="font-semibold text-slate-800">{l.employee?.name ?? '—'}</p>
                            <p className="text-xs text-slate-400">{l.employee?.email}</p>
                          </td>
                        )}
                        <td><TypeBadge t={l.type} /></td>
                        <td className="text-slate-600 whitespace-nowrap">{dayjs(l.startDate).format('DD MMM YYYY')}</td>
                        <td className="text-slate-600 whitespace-nowrap">{dayjs(l.endDate).format('DD MMM YYYY')}</td>
                        <td className="font-bold text-slate-800">{days}</td>
                        <td className="max-w-[160px] truncate text-slate-500" title={l.reason}>{l.reason}</td>
                        <td><StatusBadge s={l.status} /></td>
                        <td>
                          {isManagerPlus && l.status === 'pending' ? (
                            <button onClick={() => { setReviewing(l); setReviewNote(''); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                              <Clock size={12} /> Review
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">
                              {l.reviewedBy?.name ? `By ${l.reviewedBy.name}` : '—'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {leaves.length === 0 && (
                    <tr><td colSpan={9} className="text-center py-10 text-slate-400">No leave requests yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Request Leave Modal ──────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="card w-full max-w-md p-0 overflow-hidden animate-slide-up">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Request Leave</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6">
              {quota && (
                <div className="flex gap-2 flex-wrap mb-5">
                  {[
                    { label:'Annual',    val: quota.remaining.annual,    bg:'bg-indigo-100 text-indigo-700' },
                    { label:'Sick',      val: quota.remaining.sick,      bg:'bg-red-100 text-red-700'       },
                    { label:'Emergency', val: quota.remaining.emergency, bg:'bg-amber-100 text-amber-700'   },
                  ].map(r => (
                    <span key={r.label} className={`text-xs font-bold px-3 py-1 rounded-full ${r.bg}`}>
                      {r.label}: {r.val} left
                    </span>
                  ))}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                  <label className="label">Leave Type</label>
                  <select value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))} className="input">
                    <option value="annual">Annual</option>
                    <option value="sick">Sick</option>
                    <option value="emergency">Emergency</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Start Date</label>
                    <input type="date" required value={form.startDate}
                      onChange={e => setForm(f=>({...f,startDate:e.target.value}))} className="input" />
                  </div>
                  <div className="form-group">
                    <label className="label">End Date</label>
                    <input type="date" required min={form.startDate} value={form.endDate}
                      onChange={e => setForm(f=>({...f,endDate:e.target.value}))} className="input" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Reason</label>
                  <textarea rows={3} required value={form.reason} placeholder="Brief description…"
                    onChange={e => setForm(f=>({...f,reason:e.target.value}))}
                    className="input resize-none" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary flex items-center gap-2">
                    <Plus size={15} /> Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── Review Modal ─────────────────────────────── */}
      {reviewing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="card w-full max-w-sm p-0 overflow-hidden animate-slide-up">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Review Leave</h2>
              <button onClick={() => setReviewing(null)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-sm">
                {[
                  ['Employee', reviewing.employee?.name ?? '—'],
                  ['Type',     reviewing.type],
                  ['From',     dayjs(reviewing.startDate).format('DD MMM YYYY')],
                  ['To',       dayjs(reviewing.endDate).format('DD MMM YYYY')],
                  ['Reason',   reviewing.reason],
                ].map(([k,v]) => (
                  <div key={k} className="flex gap-3">
                    <span className="text-slate-400 w-20 shrink-0">{k}</span>
                    <span className="font-semibold text-slate-800 capitalize">{v}</span>
                  </div>
                ))}
              </div>
              <textarea rows={2} placeholder="Review note (optional)" value={reviewNote}
                onChange={e => setReviewNote(e.target.value)} className="input resize-none" />
              <div className="flex gap-3 justify-end">
                <button onClick={() => handleReview('rejected')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors">
                  <XCircle size={15} /> Reject
                </button>
                <button onClick={() => handleReview('approved')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors">
                  <CheckCircle2 size={15} /> Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
