import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Zap, Lock, User, Mail, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button.jsx';

export default function SetupPage() {
  const { setup }   = useAuth();
  const navigate    = useNavigate();
  const [show, setShow] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await setup(data);
      toast.success('Welcome to ByThawkHR!');
      navigate('/dashboard');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Setup failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4 border border-white/20">
            <Zap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">ByThawkHR</h1>
          <p className="text-blue-200 mt-1">Initial Setup — Create Super Admin</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome! Let's get started.</h2>
          <p className="text-muted text-sm mb-6">Create your admin account to set up the system.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="form-group">
              <label className="label" htmlFor="setup-name">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="setup-name"
                  className="input pl-9"
                  placeholder="John Doe"
                  {...register('name', { required: 'Name is required' })}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="setup-email">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="setup-email"
                  type="email"
                  className="input pl-9"
                  placeholder="admin@company.com"
                  {...register('email', { required: 'Email is required' })}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="setup-password">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="setup-password"
                  type={show ? 'text' : 'password'}
                  className="input pl-9 pr-10"
                  placeholder="Min. 8 characters"
                  {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' } })}
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <Button type="submit" loading={isSubmitting} className="w-full py-3">
              Create Admin Account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
