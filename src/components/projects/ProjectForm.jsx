import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';
import Button from '../ui/Button.jsx';

export default function ProjectForm({ project, onSuccess, onCancel }) {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers]             = useState([]);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: project ? {
      title: project.title, description: project.description,
      department: project.department?._id, deadline: project.deadline?.split('T')[0],
      status: project.status,
    } : { status: 'active' },
  });

  useEffect(() => {
    api.get('/departments').then(r => setDepartments(r.data)).catch(() => {});
    api.get('/users').then(r => setUsers(r.data.users ?? r.data)).catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    try {
      if (project) {
        await api.put(`/projects/${project._id}`, data);
        toast.success('Project updated');
      } else {
        await api.post('/projects', data);
        toast.success('Project created');
      }
      onSuccess?.();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-group">
        <label className="label">Project Title *</label>
        <input className="input" placeholder="e.g. Website Redesign" {...register('title', { required: true })} />
      </div>
      <div className="form-group">
        <label className="label">Description</label>
        <textarea className="input resize-none" rows={3} {...register('description')} />
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
          <label className="label">Status</label>
          <select className="input" {...register('status')}>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="label">Deadline</label>
        <input type="date" className="input" {...register('deadline')} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>{project ? 'Update' : 'Create Project'}</Button>
      </div>
    </form>
  );
}
