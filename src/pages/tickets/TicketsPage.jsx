import { useEffect, useState } from 'react';
import { Plus, Ticket, Shield, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/axios.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

function CreateTicketForm({ onSuccess, onCancel }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const onSubmit = async (data) => {
    try {
      await api.post('/tickets', data);
      toast.success('Ticket submitted successfully');
      onSuccess?.();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit ticket');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-group">
        <label className="label">Title *</label>
        <input
          type="text"
          className="input"
          placeholder="e.g. Broken office chair, VPN access issue"
          {...register('title', { required: true })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label className="label">Category *</label>
          <select className="input" {...register('category', { required: true })}>
            <option value="other">Select category</option>
            <option value="it">IT Support</option>
            <option value="hr">Human Resources</option>
            <option value="admin">Administrative</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label className="label">Priority *</label>
          <select className="input" {...register('priority', { required: true })} defaultValue="medium">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="label">Description *</label>
        <textarea
          className="input resize-none"
          rows={4}
          placeholder="Describe the issue in detail..."
          {...register('description', { required: true })}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>Submit Ticket</Button>
      </div>
    </form>
  );
}

export default function TicketsPage() {
  const { user } = useAuth();
  const isManagerPlus = ['super_admin', 'manager'].includes(user?.role);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [users, setUsers] = useState([]);
  
  // Update state for reviewing/resolving
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState('');
  const [resolution, setResolution] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const endpoint = isManagerPlus ? '/tickets' : '/tickets/my';
      const { data } = await api.get(endpoint);
      setTickets(data);
    } catch (e) {
      toast.error('Failed to load tickets');
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
    fetchTickets();
    fetchUsers();
  }, []);

  const openEditModal = (t) => {
    setSelectedTicket(t);
    setAssignedTo(t.assignedTo?._id || '');
    setStatus(t.status);
    setResolution(t.resolution || '');
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await api.put(`/tickets/${selectedTicket._id}`, {
        assignedTo: assignedTo || null,
        status,
        resolution,
      });
      toast.success('Ticket updated successfully');
      setSelectedTicket(null);
      fetchTickets();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Ticket size={24} className="text-accent" />
          <h1 className="page-title">{isManagerPlus ? 'Helpdesk Tickets' : 'My Tickets'}</h1>
        </div>
        {!isManagerPlus && (
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Ticket
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted">Loading...</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                {isManagerPlus && <th>Raised By</th>}
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Date Raised</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t._id}>
                  {isManagerPlus && (
                    <td>
                      <div>
                        <p className="font-medium text-slate-800">{t.raisedBy?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted">{t.raisedBy?.email}</p>
                      </div>
                    </td>
                  )}
                  <td>
                    <div>
                      <p className="font-medium text-slate-800">{t.title}</p>
                      <p className="text-xs text-muted max-w-xs truncate">{t.description}</p>
                    </div>
                  </td>
                  <td>
                    <span className="capitalize px-2 py-1 text-xs rounded bg-slate-100 text-slate-700">
                      {t.category}
                    </span>
                  </td>
                  <td>
                    <span className={`capitalize px-2 py-0.5 text-xs rounded border font-medium ${getPriorityColor(t.priority)}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={t.status} />
                  </td>
                  <td>
                    <span className="text-sm">
                      {t.assignedTo?.name || <span className="text-muted italic text-xs">Unassigned</span>}
                    </span>
                  </td>
                  <td className="text-xs text-muted">
                    {dayjs(t.createdAt).format('MMM D, YYYY')}
                  </td>
                  <td>
                    <Button size="sm" variant="ghost" onClick={() => openEditModal(t)}>
                      {isManagerPlus ? 'Manage' : 'View Details'}
                    </Button>
                  </td>
                </tr>
              ))}
              {!tickets.length && (
                <tr>
                  <td colSpan={isManagerPlus ? 8 : 7} className="text-center py-12 text-muted">
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* New Ticket Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create New Support Ticket">
        <CreateTicketForm onSuccess={() => { setShowModal(false); fetchTickets(); }} onCancel={() => setShowModal(false)} />
      </Modal>

      {/* Manage/View Ticket Modal */}
      <Modal open={Boolean(selectedTicket)} onClose={() => setSelectedTicket(null)} title={isManagerPlus ? "Manage Helpdesk Ticket" : "Ticket Details"}>
        {selectedTicket && (
          <form onSubmit={handleUpdateTicket} className="space-y-4">
            <div className="bg-slate-50 border rounded-xl p-4 space-y-3 text-sm">
              <div>
                <span className="text-muted text-xs block mb-0.5">Title</span>
                <span className="font-semibold text-slate-800">{selectedTicket.title}</span>
              </div>
              <div>
                <span className="text-muted text-xs block mb-0.5">Description</span>
                <span className="text-slate-700 block whitespace-pre-wrap">{selectedTicket.description}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted text-xs block mb-0.5">Category</span>
                  <span className="capitalize">{selectedTicket.category}</span>
                </div>
                <div>
                  <span className="text-muted text-xs block mb-0.5">Priority</span>
                  <span className="capitalize font-medium text-slate-800">{selectedTicket.priority}</span>
                </div>
              </div>
              {!isManagerPlus && selectedTicket.resolution && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <span className="text-emerald-800 text-xs font-semibold block mb-1">Resolution Detail</span>
                  <p className="text-emerald-700">{selectedTicket.resolution}</p>
                </div>
              )}
            </div>

            {isManagerPlus ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Status</label>
                    <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="label">Assign To</label>
                    <select className="input" value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
                      <option value="">Unassigned</option>
                      {users.map(u => (
                        <option key={u._id} value={u._id}>{u.name} ({u.designation || 'Staff'})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Resolution Details (required to resolve)</label>
                  <textarea
                    className="input resize-none"
                    rows={3}
                    placeholder="Enter details on how the issue was fixed..."
                    value={resolution}
                    onChange={e => setResolution(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setSelectedTicket(null)}>Cancel</Button>
                  <Button type="submit" loading={updating}>Save Changes</Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end pt-2">
                <Button type="button" onClick={() => setSelectedTicket(null)}>Close</Button>
              </div>
            )}
          </form>
        )}
      </Modal>
    </div>
  );
}
