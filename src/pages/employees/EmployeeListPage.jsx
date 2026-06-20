import { useEffect, useState } from 'react';
import { Plus, Search, UserCheck, UserX, Users } from 'lucide-react';
import api from '../../api/axios.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Badge from '../../components/ui/Badge.jsx';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

function EmployeeForm({ onSuccess, onCancel }) {
  const [departments, setDepts] = useState([]);
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm({ defaultValues: { role: 'employee' } });
  useEffect(() => { api.get('/departments').then(r => setDepts(r.data)).catch(() => {}); }, []);
  const onSubmit = async (data) => {
    try {
      await api.post('/users', data);
      toast.success('Employee created');
      onSuccess?.();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label className="label">Full Name *</label>
          <input className="input" placeholder="John Doe" {...register('name', { required: true })} />
        </div>
        <div className="form-group">
          <label className="label">Email *</label>
          <input type="email" className="input" placeholder="john@company.com" {...register('email', { required: true })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label className="label">Password *</label>
          <input type="password" className="input" placeholder="Min 8 chars" {...register('password', { required: true, minLength: 8 })} />
        </div>
        <div className="form-group">
          <label className="label">Role</label>
          <select className="input" {...register('role')}>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label className="label">Department</label>
          <select className="input" {...register('department')}>
            <option value="">None</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Designation</label>
          <input className="input" placeholder="e.g. Software Engineer" {...register('designation')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label className="label">Phone</label>
          <input className="input" placeholder="+1 234 567 890" {...register('phone')} />
        </div>
        <div className="form-group">
          <label className="label">Date of Joining</label>
          <input type="date" className="input" {...register('dateOfJoining')} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>Add Employee</Button>
      </div>
    </form>
  );
}

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users');
      setEmployees(data.users ?? data);
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    (e.department?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Users size={24} className="text-accent" />
          <h1 className="page-title">Employees</h1>
        </div>
        <Button onClick={() => setShowModal(true)} id="add-employee-btn">
          <Plus size={16} /> Add Employee
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-9"
          placeholder="Search by name, email, or department..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          id="employee-search"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-muted">Loading...</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr
                  key={emp._id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/employees/${emp._id}`)}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-sm shrink-0">
                        {emp.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{emp.name}</p>
                        <p className="text-xs text-muted">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{emp.department?.name || <span className="text-muted">—</span>}</td>
                  <td>{emp.designation || <span className="text-muted">—</span>}</td>
                  <td>{emp.dateOfJoining ? dayjs(emp.dateOfJoining).format('MMM D, YYYY') : '—'}</td>
                  <td>
                    {emp.isActive
                      ? <Badge color="green">Active</Badge>
                      : <Badge color="red">Inactive</Badge>}
                  </td>
                  <td><Badge color="blue" className="capitalize">{emp.role.replace('_', ' ')}</Badge></td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={6} className="text-center py-12 text-muted">No employees found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New Employee" size="lg">
        <EmployeeForm onSuccess={() => { setShowModal(false); fetchEmployees(); }} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  );
}
