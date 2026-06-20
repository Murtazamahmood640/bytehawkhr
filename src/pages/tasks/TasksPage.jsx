import { useEffect, useState } from 'react';
import { Plus, CheckSquare } from 'lucide-react';
import api from '../../api/axios.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import KanbanBoard from '../../components/tasks/KanbanBoard.jsx';
import TaskForm from '../../components/tasks/TaskForm.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function TasksPage() {
  const { user } = useAuth();
  const isManagerPlus = ['super_admin', 'manager'].includes(user?.role);
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const endpoint = isManagerPlus ? '/tasks' : '/tasks/my';
      const { data } = await api.get(endpoint);
      setTasks(data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, []);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <CheckSquare size={24} className="text-accent" />
          <h1 className="page-title">Tasks</h1>
        </div>
        {isManagerPlus && (
          <Button onClick={() => { setSelectedTask(null); setShowModal(true); }} id="add-task-btn">
            <Plus size={16} /> New Task
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted">Loading tasks...</div>
      ) : (
        <KanbanBoard
          tasks={tasks}
          onTaskClick={(t) => { setSelectedTask(t); setShowModal(true); }}
          onRefresh={fetchTasks}
        />
      )}

      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); setSelectedTask(null); }}
        title={selectedTask ? 'Edit Task' : 'Create Task'}
      >
        <TaskForm
          task={selectedTask}
          onSuccess={() => { setShowModal(false); setSelectedTask(null); fetchTasks(); }}
          onCancel={() => { setShowModal(false); setSelectedTask(null); }}
        />
      </Modal>
    </div>
  );
}
