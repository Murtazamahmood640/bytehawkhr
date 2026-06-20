import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSetupDone, setIsSetupDone] = useState(null);

  // Check setup status on mount
  useEffect(() => {
    api.get('/auth/setup-status')
      .then(r => setIsSetupDone(r.data.isSetupDone))
      .catch(() => setIsSetupDone(false))
      .finally(() => setLoading(false));
  }, []);

  // Listen for forced logout (401 with failed refresh)
  useEffect(() => {
    const handler = () => { setUser(null); window.__accessToken = null; };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const setup = useCallback(async (data) => {
    const res = await api.post('/auth/setup', data);
    window.__accessToken = res.data.accessToken;
    setUser(res.data.user);
    setIsSetupDone(true);
    return res.data;
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    window.__accessToken = res.data.accessToken;
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch {}
    window.__accessToken = null;
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isSetupDone, setup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
