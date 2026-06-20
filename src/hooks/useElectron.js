/**
 * useElectron — React hook for Electron desktop integration
 *
 * Usage:
 *   const { isElectron, notify, appVersion } = useElectron();
 *
 * Safe to use in web mode — all calls are no-ops if not in Electron.
 */

import { useEffect, useState } from 'react';

const api = typeof window !== 'undefined' ? window.electronAPI : null;

export function useElectron() {
  const [isElectron] = useState(() => !!api?.isElectron);
  const [appVersion, setAppVersion] = useState(null);
  const [autoLaunch, setAutoLaunchState] = useState(false);
  const [minimizeToTray, setMinimizeToTrayState] = useState(true);

  useEffect(() => {
    if (!api) return;
    api.getAppVersion().then(setAppVersion);
    api.getAutoLaunch().then(setAutoLaunchState);
    api.getMinimizeToTray().then(setMinimizeToTrayState);

    // Listen for update-available from main process
    api.onUpdateAvailable((version) => {
      console.info(`[ByThawkHR] Update available: v${version}`);
    });
  }, []);

  /** Send a native OS notification */
  const notify = (title, body, silent = false) => {
    if (api) {
      api.notify({ title, body, silent });
    } else {
      // Fallback: browser Notification API
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      }
    }
  };

  /** Toggle auto-launch on Windows startup */
  const setAutoLaunch = async (enabled) => {
    if (!api) return;
    await api.setAutoLaunch(enabled);
    setAutoLaunchState(enabled);
  };

  /** Toggle minimize-to-tray behaviour */
  const setMinimizeToTray = async (val) => {
    if (!api) return;
    await api.setMinimizeToTray(val);
    setMinimizeToTrayState(val);
  };

  /** Manually trigger update check */
  const checkForUpdates = () => api?.checkForUpdates();

  return {
    isElectron,
    appVersion,
    notify,
    autoLaunch,
    setAutoLaunch,
    minimizeToTray,
    setMinimizeToTray,
    checkForUpdates,
  };
}
