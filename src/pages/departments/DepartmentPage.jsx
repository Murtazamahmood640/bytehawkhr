import { useEffect, useState } from 'react';
import { Plus, Building2, User, FileText, Settings, Trash2 } from 'lucide-react';
import api from '../../api/axios.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

function DepartmentForm({ onSuccess, onCancel, users = [], initialData = null }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description,
      manager: initialData.manager?._id || ''
    } : {}
  });

  const onSubmit = async (data) => {
    try {
      if (initialData) {
        await api.put(`/departments/${initialData._id}`, data);
        toast.success('Department updated successfully');
      } else {
        await api.post('/departments', data);
        toast.success('Department created successfully');
      }
      onSuccess?.();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save department');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-group">
        <label className="label">Department Name *</label>
        <input
          type="text"
          className="input"
          placeholder="e.g. Engineering, Human Resources"
          {...register('name', { required: true })}
        />
      </div>

      <div className="form-group">
        <label className="label">Department Manager</label>
        <select className="input" {...register('manager')}>
          <option value="">Select Manager</option>
          {users.map(u => (
            <option key={u._id} value={u._id}>{u.name} ({u.designation || 'Staff'})</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="label">Description</label>
        <textarea
          className="input resize-none"
          rows={3}
          placeholder="Brief description of the department's responsibilities..."
          {...register('description')}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>
          {initialData ? 'Save Changes' : 'Create Department'}
        </Button>
      </div>
    </form>
  );
}

export default function DepartmentPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const isManagerPlus = ['super_admin', 'manager'].includes(user?.role);

  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/departments');
      setDepartments(data);
    } catch (e) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!isManagerPlus) return;
    try {
      const { data } = await api.get('/users');
      setUsers(data.users ?? data);
    } catch {}
  };

  useEffect(() => {
    fetchDepartments();
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await api.delete(`/departments/${id}`);
      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete department');
    }
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Building2 size={24} className="text-accent" />
          <h1 className="page-title">Departments</h1>
        </div>
        {isManagerPlus && (
          <Button onClick={() => { setEditingDept(null); setShowModal(true); }}>
            <Plus size={16} /> Create Department
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted">Loading departments...</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Description</th>
                <th>Manager</th>
                {isManagerPlus && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {departments.map(d => (
                <tr key={d._id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Building2 size={16} />
                      </div>
                      <span className="font-semibold text-slate-800">{d.name}</span>
                    </div>
                  </td>
                  <td>
                    <p className="text-sm text-slate-600 max-w-sm truncate" title={d.description}>
                      {d.description || <span className="text-muted italic text-xs">No description</span>}
                    </p>
                  </td>
                  <td>
                    {d.manager ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-medium">
                          {d.manager.name[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-slate-700">{d.manager.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted italic">Unassigned</span>
                    )}
                  </td>
                  {isManagerPlus && (
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEditModal(d)}>
                          <Settings size={14} /> Edit
                        </Button>
                        {isSuperAdmin && (
                          <Button size="sm" variant="danger" onClick={() => handleDelete(d._id)}>
                            <Trash2 size={14} /> Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {!departments.length && (
                <tr>
                  <td colSpan={isManagerPlus ? 4 : 3} className="text-center py-12 text-muted">
                    No departments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Creation / Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingDept ? "Edit Department" : "Create New Department"}>
        <DepartmentForm
          users={users}
          initialData={editingDept}
          onSuccess={() => { setShowModal(false); fetchDepartments(); }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}
