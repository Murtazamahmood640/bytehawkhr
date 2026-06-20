import { useEffect, useState } from 'react';
import { Plus, Search, FolderKanban } from 'lucide-react';
import api from '../../api/axios.js';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import ProjectCard from '../../components/projects/ProjectCard.jsx';
import ProjectForm from '../../components/projects/ProjectForm.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ProjectsPage() {
  const { user } = useAuth();
  const isManagerPlus = ['super_admin', 'manager'].includes(user?.role);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatus] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const filtered = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <FolderKanban size={24} className="text-accent" />
          <h1 className="page-title">Projects</h1>
        </div>
        {isManagerPlus && (
          <Button onClick={() => setShowModal(true)} id="add-project-btn">
            <Plus size={16} /> New Project
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9 w-56" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} id="project-search" />
        </div>
        <select className="input w-36" value={statusFilter} onChange={e => setStatus(e.target.value)} id="project-status-filter">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted">Loading projects...</div>
      ) : filtered.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(p => <ProjectCard key={p._id} project={p} />)}
        </div>
      ) : (
        <div className="text-center py-20 text-muted">
          <FolderKanban size={48} className="mx-auto mb-3 text-slate-300 animate-pulse" />
          <p>No projects found.</p>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create New Project" size="lg">
        <ProjectForm onSuccess={() => { setShowModal(false); fetchProjects(); }} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  );
}
