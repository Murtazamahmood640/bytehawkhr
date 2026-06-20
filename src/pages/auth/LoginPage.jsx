import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [show, setShow] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm();

  const onSubmit = async ({ email, password }) => {
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Login failed');
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
          <p className="text-blue-200 mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Welcome back!</h2>
          <p className="text-muted text-sm mb-6">Enter your credentials to continue.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="form-group">
              <label className="label" htmlFor="login-email">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  className="input pl-9"
                  placeholder="you@company.com"
                  {...register('email', { required: 'Email is required' })}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label className="label" htmlFor="login-password">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-password"
                  type={show ? 'text' : 'password'}
                  className="input pl-9 pr-10"
                  placeholder="Your password"
                  {...register('password', { required: 'Password is required' })}
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <Button type="submit" loading={isSubmitting} className="w-full py-3">
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-blue-300 text-xs mt-6">
          &copy; {new Date().getFullYear()} ByThawkHR. All rights reserved.
        </p>
      </div>
    </div>
  );
}
