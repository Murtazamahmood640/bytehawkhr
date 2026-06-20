import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2 } from 'lucide-react';
import api from '../../api/axios.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import KanbanBoard from '../../components/tasks/KanbanBoard.jsx';
import TaskForm from '../../components/tasks/TaskForm.jsx';
import ProjectForm from '../../components/projects/ProjectForm.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import dayjs from 'dayjs';

export default function ProjectDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isManagerPlus = ['super_admin', 'manager'].includes(user?.role);

  const [project, setProject] = useState(null);
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal]   = useState(false);
  const [showEditModal, setShowEditModal]   = useState(false);
  const [selectedTask, setSelectedTask]     = useState(null);

  const fetchProject = async () => {
    const [pRes, tRes] = await Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/tasks`),
    ]);
    setProject(pRes.data);
    setTasks(tRes.data);
  };

  useEffect(() => {
    fetchProject().catch(() => navigate('/projects')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-16 text-muted">Loading...</div>;
  if (!project) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/projects')} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors mt-1">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="page-title">{project.title}</h1>
            <StatusBadge status={project.status} />
          </div>
          {project.description && <p className="text-muted text-sm mt-1">{project.description}</p>}
        </div>
        {isManagerPlus && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowEditModal(true)}><Edit2 size={15} /> Edit</Button>
            <Button onClick={() => { setSelectedTask(null); setShowTaskModal(true); }}><Plus size={15} /> Add Task</Button>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-muted text-xs">Progress</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{project.progress}%</p>
          <ProgressBar value={project.progress} showLabel={false} className="mt-2" />
        </div>
        <div className="card">
          <p className="text-muted text-xs">Deadline</p>
          <p className="text-lg font-semibold text-slate-800 mt-1">{project.deadline ? dayjs(project.deadline).format('MMM D, YYYY') : 'No deadline'}</p>
        </div>
        <div className="card">
          <p className="text-muted text-xs">Team Members</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{project.members?.length || 0}</p>
          <div className="flex -space-x-2 mt-2">
            {(project.members || []).slice(0, 5).map(m => (
              <div key={m._id} className="w-7 h-7 rounded-full bg-accent/20 border-2 border-white flex items-center justify-center text-accent text-xs font-semibold">
                {m.name?.[0]}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban */}
      <div>
        <h2 className="font-semibold text-slate-800 mb-4">Task Board</h2>
        <KanbanBoard
          tasks={tasks}
          onTaskClick={(t) => { setSelectedTask(t); setShowTaskModal(true); }}
          onRefresh={fetchProject}
        />
      </div>

      {/* Task Modal */}
      <Modal open={showTaskModal} onClose={() => { setShowTaskModal(false); setSelectedTask(null); }} title={selectedTask ? 'Edit Task' : 'Add Task'}>
        <TaskForm
          task={selectedTask}
          projectId={id}
          onSuccess={() => { setShowTaskModal(false); setSelectedTask(null); fetchProject(); }}
          onCancel={() => { setShowTaskModal(false); setSelectedTask(null); }}
        />
      </Modal>

      {/* Edit Project Modal */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Project" size="lg">
        <ProjectForm project={project} onSuccess={() => { setShowEditModal(false); fetchProject(); }} onCancel={() => setShowEditModal(false)} />
      </Modal>
    </div>
  );
}
