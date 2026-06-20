import { useState } from 'react';
import { Menu, Bell, Settings } from 'lucide-react';
import { useUI } from '../../context/UIContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { toggleSidebar } = useUI();
  const { user } = useAuth();
  
  const [showSettings, setShowSettings] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    try {
      setLoading(true);
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setShowSettings(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center px-6 gap-4 shrink-0">
      <button
        id="sidebar-toggle"
        onClick={toggleSidebar}
        className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1">
        <p className="text-slate-800 font-semibold">{greeting}, {user?.name?.split(' ')[0]}</p>
        <p className="text-xs text-muted">{
          now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        }</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          onClick={() => setShowSettings(true)}
          title="Account Settings"
          id="navbar-settings-btn"
        >
          <Settings size={20} />
        </button>
        <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors" id="notification-bell">
          <Bell size={20} />
        </button>
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-sm">
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>

      {/* Change Password / Settings Modal */}
      <Modal open={showSettings} onClose={() => setShowSettings(false)} title="Account Settings">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-800 border-b pb-2">Change Password</h4>
          
          <div className="form-group">
            <label className="label">Current Password</label>
            <input
              type="password"
              className="input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">New Password</label>
            <input
              type="password"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Confirm New Password</label>
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowSettings(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Change Password</Button>
          </div>
        </form>
      </Modal>
    </header>
  );
}
