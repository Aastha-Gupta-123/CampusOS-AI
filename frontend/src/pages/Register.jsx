import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Eye, EyeOff, Loader2, UserPlus, User, Hash, Mail, Phone,
  BookOpen, Calendar, Home, Building2, Lock, GraduationCap, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const departments = [
  'Computer Science Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Artificial Intelligence & Data Science',
  'Cyber Security',
  'Biotechnology',
  'Other',
];

const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    register_number: '',
    email: '',
    phone: '',
    department: '',
    year: '',
    hostel_status: '',
    password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};

    if (!formData.full_name.trim()) errs.full_name = 'Full name is required';
    else if (formData.full_name.trim().length < 2) errs.full_name = 'Name must be at least 2 characters';

    if (!formData.register_number.trim()) errs.register_number = 'Register number is required';

    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Invalid email address';

    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    else if (formData.phone.replace(/\D/g, '').length < 10) errs.phone = 'Phone must have at least 10 digits';

    if (!formData.department) errs.department = 'Department is required';
    if (!formData.year) errs.year = 'Year is required';
    if (!formData.hostel_status) errs.hostel_status = 'Hostel status is required';

    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 8) errs.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(formData.password)) errs.password = 'Must contain an uppercase letter';
    else if (!/[a-z]/.test(formData.password)) errs.password = 'Must contain a lowercase letter';
    else if (!/\d/.test(formData.password)) errs.password = 'Must contain a number';

    if (!formData.confirm_password) errs.confirm_password = 'Please confirm your password';
    else if (formData.password !== formData.confirm_password) errs.confirm_password = 'Passwords do not match';

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
      const res = await register({
        full_name: formData.full_name.trim(),
        register_number: formData.register_number.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        department: formData.department,
        year: formData.year,
        hostel_status: formData.hostel_status,
        password: formData.password,
        confirm_password: formData.confirm_password,
      });

      if (res.success) {
        toast.success('Registration successful! Please log in.');
        navigate('/login', { replace: true });
      } else {
        toast.error(res.message || 'Registration failed');
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        detail.forEach((d) => toast.error(d.msg || 'Validation error'));
      } else {
        toast.error(detail || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0f1e] bg-mesh dark:bg-mesh-dark p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-600 shadow-lg shadow-primary-500/30 mb-4"
          >
            <GraduationCap className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Join CampusMate AI platform</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text" name="full_name" value={formData.full_name} onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`input-field pl-10 ${errors.full_name ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name}</p>}
            </div>

            {/* Row: Register Number & Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Register No.</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text" name="register_number" value={formData.register_number} onChange={handleChange}
                    placeholder="e.g. 22CS001"
                    className={`input-field pl-10 ${errors.register_number ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.register_number && <p className="mt-1 text-xs text-red-500">{errors.register_number}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="you@college.edu"
                    className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text" name="phone" value={formData.phone} onChange={handleChange}
                  placeholder="Enter your phone number"
                  className={`input-field pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>

            {/* Row: Department & Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <select
                    name="department" value={formData.department} onChange={handleChange}
                    className={`input-field pl-10 appearance-none ${errors.department ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select...</option>
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                {errors.department && <p className="mt-1 text-xs text-red-500">{errors.department}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <select
                    name="year" value={formData.year} onChange={handleChange}
                    className={`input-field pl-10 appearance-none ${errors.year ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select...</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                {errors.year && <p className="mt-1 text-xs text-red-500">{errors.year}</p>}
              </div>
            </div>

            {/* Hostel Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hostel / Day Scholar</label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <select
                  name="hostel_status" value={formData.hostel_status} onChange={handleChange}
                  className={`input-field pl-10 appearance-none ${errors.hostel_status ? 'border-red-500' : ''}`}
                >
                  <option value="">Select...</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Day Scholar">Day Scholar</option>
                </select>
              </div>
              {errors.hostel_status && <p className="mt-1 text-xs text-red-500">{errors.hostel_status}</p>}
            </div>

            {/* Row: Password & Confirm */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                    placeholder="Min 8 chars"
                    className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'} name="confirm_password" value={formData.confirm_password} onChange={handleChange}
                    placeholder="Re-enter password"
                    className={`input-field pl-10 pr-10 ${errors.confirm_password ? 'border-red-500' : ''}`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirm_password && <p className="mt-1 text-xs text-red-500">{errors.confirm_password}</p>}
              </div>
            </div>

            {/* Password strength hint */}
            {formData.password && !errors.password && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div className={`h-full transition-all ${
                    formData.password.length < 8 ? 'w-1/4 bg-red-500' :
                    formData.password.length < 10 ? 'w-2/4 bg-amber-500' :
                    formData.password.length < 12 ? 'w-3/4 bg-yellow-500' : 'w-full bg-emerald-500'
                  }`} />
                </div>
                <span className="text-[10px] text-gray-400">
                  {formData.password.length < 8 ? 'Weak' :
                   formData.password.length < 10 ? 'Fair' :
                   formData.password.length < 12 ? 'Good' : 'Strong'}
                </span>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Create Account</>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                Sign In <ChevronRight className="w-3 h-3 inline" />
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          &copy; {new Date().getFullYear()} CampusMate AI. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}