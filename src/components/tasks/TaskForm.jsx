import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';
import Button from '../ui/Button.jsx';

export default function TaskForm({ task, projectId, onSuccess, onCancel }) {
  const [users, setUsers]     = useState([]);
  const [projects, setProjects] = useState([]);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: task ? {
      title: task.title, description: task.description,
      assignedTo: task.assignedTo?._id, priority: task.priority,
      status: task.status, dueDate: task.dueDate?.split('T')[0],
      project: task.project?._id || projectId,
    } : { priority: 'medium', status: 'todo', project: projectId },
  });

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data.users ?? r.data)).catch(() => {});
    if (!projectId) api.get('/projects').then(r => setProjects(r.data)).catch(() => {});
  }, [projectId]);

  const onSubmit = async (data) => {
    try {
      if (task) {
        await api.put(`/tasks/${task._id}`, data);
        toast.success('Task updated');
      } else {
        await api.post('/tasks', data);
        toast.success('Task created');
      }
      onSuccess?.();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save task');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-group">
        <label className="label">Title *</label>
        <input className="input" placeholder="Task title" {...register('title', { required: true })} />
      </div>
      <div className="form-group">
        <label className="label">Description</label>
        <textarea className="input resize-none" rows={3} placeholder="Optional description..." {...register('description')} />
      </div>
      {!projectId && (
        <div className="form-group">
          <label className="label">Project *</label>
          <select className="input" {...register('project', { required: true })}>
            <option value="">Select project</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label className="label">Priority</label>
          <select className="input" {...register('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="form-group">
          <label className="label">Status</label>
          <select className="input" {...register('status')}>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label className="label">Assigned To</label>
          <select className="input" {...register('assignedTo')}>
            <option value="">Unassigned</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Due Date</label>
          <input type="date" className="input" {...register('dueDate')} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>{task ? 'Update Task' : 'Create Task'}</Button>
      </div>
    </form>
  );
}
