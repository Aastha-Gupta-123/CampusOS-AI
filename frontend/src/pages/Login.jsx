import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Eye, EyeOff, Loader2, LogIn, Mail, Lock, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [formData, setFormData] = useState({ email_or_register: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const validate = () => {
    const errs = {};
    if (!formData.email_or_register.trim()) errs.email_or_register = 'Email or Register Number is required';
    if (!formData.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await login(formData.email_or_register.trim(), formData.password);
      if (res.success) {
        toast.success(`Welcome back, ${res.user?.full_name || 'User'}!`);
        navigate(from, { replace: true });
      } else {
        toast.error(res.message || 'Login failed');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid credentials. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0f1e] bg-mesh dark:bg-mesh-dark p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-600 shadow-lg shadow-primary-500/30 mb-4"
          >
            <GraduationCap className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your CampusMate AI account</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email / Register Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email or Register Number
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="email_or_register"
                  value={formData.email_or_register}
                  onChange={handleChange}
                  placeholder="Enter your email or register number"
                  className={`input-field pl-10 ${errors.email_or_register ? 'border-red-500 focus:ring-red-500/30' : ''}`}
                />
              </div>
              {errors.email_or_register && (
                <p className="mt-1 text-xs text-red-500">{errors.email_or_register}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500/30' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-500 focus:ring-primary-500/30"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">Remember me</span>
              </label>
              <button type="button" className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : (
                <><LogIn className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white dark:bg-slate-800/80 text-gray-400 dark:text-gray-500">New to CampusMate?</span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="btn-secondary w-full justify-center"
          >
            <Sparkles className="w-4 h-4" /> Create an Account
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          &copy; {new Date().getFullYear()} CampusMate AI. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}