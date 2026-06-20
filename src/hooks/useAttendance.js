import { useState, useCallback } from 'react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

export function useAttendance() {
  const [today, setToday]   = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchToday = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/attendance/today');
      setToday(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  const checkIn = async () => {
    try {
      setLoading(true);
      const { data } = await api.post('/attendance/checkin');
      setToday(data);
      toast.success('Checked in successfully!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const checkOut = async () => {
    try {
      setLoading(true);
      const { data } = await api.put('/attendance/checkout');
      setToday(data);
      toast.success('Checked out successfully!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  return { today, loading, fetchToday, checkIn, checkOut };
}
