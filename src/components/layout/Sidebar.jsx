import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, Clock, CalendarOff,
  FolderKanban, CheckSquare, Ticket, BarChart3, LogOut, Zap, Monitor
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import toast from 'react-hot-toast';

const isElectron = !!window?.electronAPI?.isElectron;

const NAV = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',  roles: ['super_admin','manager','employee'] },
  { to: '/employees',  icon: Users,           label: 'Employees',   roles: ['super_admin','manager'] },
  { to: '/departments', icon: Building2,        label: 'Departments', roles: ['super_admin','manager'] },
  { to: '/attendance', icon: Clock,            label: 'Attendance',  roles: ['super_admin','manager','employee'] },
  { to: '/leaves',     icon: CalendarOff,      label: 'Leave',       roles: ['super_admin','manager','employee'] },
  { to: '/projects',   icon: FolderKanban,     label: 'Projects',    roles: ['super_admin','manager','employee'] },
  { to: '/tasks',      icon: CheckSquare,      label: 'Tasks',       roles: ['super_admin','manager','employee'] },
  { to: '/tickets',    icon: Ticket,           label: 'Helpdesk',    roles: ['super_admin','manager','employee'] },
  { to: '/analytics',  icon: BarChart3,        label: 'Analytics',   roles: ['super_admin','manager'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { closeSidebar }  = useUI();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('Logged out');
  };

  const navItems = NAV.filter(n => n.roles.includes(user?.role));

  return (
    <div className="flex flex-col h-full px-4 py-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-base leading-tight">ByThawkHR</h1>
          <p className="text-blue-300 text-xs">Management Suite</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={closeSidebar}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
        {/* Desktop Settings — only in Electron app */}
        {isElectron && (
          <NavLink
            to="/settings/desktop"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
            }
          >
            <Monitor size={18} />
            <span>Desktop App</span>
          </NavLink>
        )}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/10 pt-4 mt-4">
        <div className="flex items-center gap-3 px-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-blue-300 text-xs capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-link sidebar-link-inactive w-full text-red-400 hover:text-red-300 hover:bg-red-400/10"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
