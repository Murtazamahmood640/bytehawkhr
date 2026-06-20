import { useNavigate } from 'react-router-dom';
import { Calendar, Users, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../ui/Badge.jsx';
import ProgressBar from '../ui/ProgressBar.jsx';
import dayjs from 'dayjs';

export default function ProjectCard({ project }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/projects/${project._id}`)}
      className="card cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 group-hover:text-accent transition-colors truncate">
            {project.title}
          </h3>
          {project.department && (
            <p className="text-xs text-muted mt-0.5">{project.department.name}</p>
          )}
        </div>
        <StatusBadge status={project.status} />
      </div>

      {project.description && (
        <p className="text-sm text-muted line-clamp-2 mb-4">{project.description}</p>
      )}

      <ProgressBar value={project.progress} />

      <div className="flex items-center justify-between mt-4 text-xs text-muted">
        <div className="flex items-center gap-3">
          {project.deadline && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              {dayjs(project.deadline).format('MMM D, YYYY')}
            </div>
          )}
          {project.members?.length > 0 && (
            <div className="flex items-center gap-1">
              <Users size={12} />
              {project.members.length} member{project.members.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 text-accent transition-opacity" />
      </div>
    </div>
  );
}
