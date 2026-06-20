import { useState } from 'react';
import { Monitor, Bell, RefreshCw, Power, Info, ToggleLeft, ToggleRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useElectron } from '../../hooks/useElectron';

export default function DesktopSettings() {
  const {
    isElectron,
    appVersion,
    autoLaunch,
    setAutoLaunch,
    minimizeToTray,
    setMinimizeToTray,
    checkForUpdates,
    notify,
  } = useElectron();

  const [updateStatus, setUpdateStatus] = useState(null); // null | 'checking' | 'latest' | 'error'
  const [testNotifSent, setTestNotifSent] = useState(false);

  const handleCheckUpdate = async () => {
    setUpdateStatus('checking');
    const result = await checkForUpdates();
    if (result?.isDev) {
      setUpdateStatus('dev');
    } else if (result?.error) {
      setUpdateStatus('error');
    } else {
      setUpdateStatus('latest');
    }
    setTimeout(() => setUpdateStatus(null), 4000);
  };

  const handleTestNotif = () => {
    notify('ByThawkHR', 'Desktop notifications are working correctly! ✅');
    setTestNotifSent(true);
    setTimeout(() => setTestNotifSent(false), 3000);
  };

  if (!isElectron) {
    return (
      <div className="desktop-settings-page">
        <div className="web-notice">
          <Monitor size={40} className="web-notice-icon" />
          <h2>Desktop App Required</h2>
          <p>These settings are only available in the ByThawkHR desktop application.</p>
          <p className="sub">Download the desktop app to access native notifications, auto-launch, and more.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="desktop-settings-page">
      <div className="ds-header">
        <Monitor size={22} />
        <div>
          <h1 className="ds-title">Desktop App Settings</h1>
          <p className="ds-subtitle">Manage how ByThawkHR behaves on your computer</p>
        </div>
      </div>

      <div className="ds-grid">

        {/* Startup & Tray */}
        <div className="ds-card">
          <div className="ds-card-header">
            <Power size={18} />
            <h3>Startup & Tray</h3>
          </div>
          <div className="ds-card-body">
            <div className="ds-toggle-row">
              <div>
                <div className="ds-toggle-label">Launch on Windows Startup</div>
                <div className="ds-toggle-desc">ByThawkHR will start automatically when you turn on your computer</div>
              </div>
              <button
                className={`ds-toggle-btn ${autoLaunch ? 'active' : ''}`}
                onClick={() => setAutoLaunch(!autoLaunch)}
                title={autoLaunch ? 'Disable auto-launch' : 'Enable auto-launch'}
              >
                {autoLaunch ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </button>
            </div>

            <div className="ds-divider" />

            <div className="ds-toggle-row">
              <div>
                <div className="ds-toggle-label">Minimize to System Tray on Close</div>
                <div className="ds-toggle-desc">Instead of quitting, the app will keep running in the taskbar tray area</div>
              </div>
              <button
                className={`ds-toggle-btn ${minimizeToTray ? 'active' : ''}`}
                onClick={() => setMinimizeToTray(!minimizeToTray)}
              >
                {minimizeToTray ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="ds-card">
          <div className="ds-card-header">
            <Bell size={18} />
            <h3>Desktop Notifications</h3>
          </div>
          <div className="ds-card-body">
            <p className="ds-desc">
              ByThawkHR sends native Windows notifications for task assignments, leave approvals, ticket updates, and more.
            </p>
            <button
              className={`ds-btn ${testNotifSent ? 'ds-btn-success' : ''}`}
              onClick={handleTestNotif}
              disabled={testNotifSent}
            >
              {testNotifSent ? (
                <><CheckCircle size={16} /> Notification Sent!</>
              ) : (
                <><Bell size={16} /> Send Test Notification</>
              )}
            </button>
          </div>
        </div>

        {/* Updates */}
        <div className="ds-card">
          <div className="ds-card-header">
            <RefreshCw size={18} />
            <h3>Updates</h3>
          </div>
          <div className="ds-card-body">
            <p className="ds-desc">
              ByThawkHR automatically checks for updates in the background. You can also check manually.
            </p>
            <button
              className={`ds-btn ${updateStatus === 'checking' ? 'ds-btn-loading' : ''}`}
              onClick={handleCheckUpdate}
              disabled={updateStatus === 'checking'}
            >
              <RefreshCw size={16} className={updateStatus === 'checking' ? 'spin' : ''} />
              {updateStatus === 'checking' ? 'Checking...' : 'Check for Updates'}
            </button>

            {updateStatus === 'latest' && (
              <div className="ds-status ds-status-success">
                <CheckCircle size={14} /> You are on the latest version
              </div>
            )}
            {updateStatus === 'dev' && (
              <div className="ds-status ds-status-info">
                <Info size={14} /> Running in development mode
              </div>
            )}
            {updateStatus === 'error' && (
              <div className="ds-status ds-status-error">
                <AlertCircle size={14} /> Could not check for updates
              </div>
            )}
          </div>
        </div>

        {/* App Info */}
        <div className="ds-card">
          <div className="ds-card-header">
            <Info size={18} />
            <h3>App Information</h3>
          </div>
          <div className="ds-card-body">
            <div className="ds-info-row">
              <span>Application</span><span>ByThawkHR</span>
            </div>
            <div className="ds-info-row">
              <span>Version</span><span>v{appVersion || '—'}</span>
            </div>
            <div className="ds-info-row">
              <span>Platform</span><span>Windows Desktop</span>
            </div>
            <div className="ds-info-row">
              <span>Framework</span><span>Electron + React</span>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .desktop-settings-page {
          padding: 32px;
          max-width: 900px;
        }
        .ds-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 32px;
          color: #06b6d4;
        }
        .ds-title {
          font-size: 22px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0;
        }
        .ds-subtitle {
          font-size: 13px;
          color: #64748b;
          margin: 4px 0 0;
        }
        .ds-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .ds-card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 14px;
          overflow: hidden;
        }
        .ds-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 20px;
          background: rgba(6,182,212,0.06);
          border-bottom: 1px solid #334155;
          color: #06b6d4;
        }
        .ds-card-header h3 {
          font-size: 14px;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0;
        }
        .ds-card-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .ds-toggle-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }
        .ds-toggle-label {
          font-size: 14px;
          font-weight: 500;
          color: #e2e8f0;
          margin-bottom: 4px;
        }
        .ds-toggle-desc {
          font-size: 12px;
          color: #64748b;
          line-height: 1.5;
        }
        .ds-toggle-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #475569;
          padding: 0;
          flex-shrink: 0;
          transition: color 0.2s;
        }
        .ds-toggle-btn.active { color: #06b6d4; }
        .ds-toggle-btn:hover { color: #0ea5e9; }
        .ds-divider {
          height: 1px;
          background: #334155;
        }
        .ds-desc {
          font-size: 13px;
          color: #64748b;
          line-height: 1.6;
        }
        .ds-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          background: rgba(6,182,212,0.1);
          border: 1px solid rgba(6,182,212,0.3);
          border-radius: 8px;
          color: #06b6d4;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          width: fit-content;
        }
        .ds-btn:hover:not(:disabled) {
          background: rgba(6,182,212,0.2);
          border-color: #06b6d4;
        }
        .ds-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .ds-btn-success { color: #10b981; border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.1); }
        .ds-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          padding: 8px 12px;
          border-radius: 8px;
        }
        .ds-status-success { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
        .ds-status-error   { background: rgba(239,68,68,0.1);  color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
        .ds-status-info    { background: rgba(6,182,212,0.1);  color: #06b6d4; border: 1px solid rgba(6,182,212,0.2); }
        .ds-info-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          padding: 8px 0;
          border-bottom: 1px solid #1e293b;
        }
        .ds-info-row span:first-child { color: #64748b; }
        .ds-info-row span:last-child  { color: #e2e8f0; font-weight: 500; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Web fallback notice */
        .web-notice {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 60px;
          text-align: center;
          color: #475569;
        }
        .web-notice-icon { color: #334155; margin-bottom: 8px; }
        .web-notice h2 { color: #e2e8f0; font-size: 20px; margin: 0; }
        .web-notice p  { font-size: 14px; margin: 0; }
        .web-notice .sub { font-size: 12px; color: #334155; }

        @media (max-width: 700px) {
          .ds-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
