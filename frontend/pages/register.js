import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { BookOpen, UserPlus, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser(data.name, data.email, data.password, data.privacyConsent);
      toast.success('Registration successful!');
      router.push('/resources');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .btn-blue { background: #2563eb; transition: background 0.15s; }
        .btn-blue:hover { background: #1d4ed8; }
        .input-field { transition: border-color 0.15s, box-shadow 0.15s; border: 1px solid #e5e7eb; }
        .input-field:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
      `}</style>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gray-900 flex-col justify-between p-12">
        <Link href="/" className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-blue-400" />
          <span className="text-white font-bold">EduShare Sierra Leone</span>
        </Link>

        <div>
          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Join Sierra Leone's education platform
          </h1>
          <p className="text-gray-400 text-base mb-8 leading-relaxed">
            Create a free account and start sharing educational resources with thousands of educators.
          </p>
          <ul className="space-y-3">
            {[
              'Upload and share educational materials',
              'Access resources from educators nationwide',
              "Contribute to Sierra Leone's education",
            ].map((item) => (
              <li key={item} className="flex items-start space-x-3">
                <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-gray-600 text-sm">© 2026 EduShare Sierra Leone</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md my-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center space-x-2 mb-8 justify-center">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-gray-900">EduShare Sierra Leone</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="mb-7">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Create account</h2>
              <p className="text-gray-500 text-sm">Join our educational community today</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...register('name', { required: 'Name is required' })}
                    type="text"
                    className="input-field w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-gray-900 text-sm"
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center space-x-1">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /><span>{errors.name.message}</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...register('email', { required: 'Email is required' })}
                    type="email"
                    className="input-field w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-gray-900 text-sm"
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center space-x-1">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /><span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="input-field w-full pl-10 pr-10 py-2.5 rounded-lg bg-white text-gray-900 text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center space-x-1">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /><span>{errors.password.message}</span>
                  </p>
                )}
              </div>

              {/* Privacy consent */}
              <div className="flex items-start space-x-3">
                <input
                  {...register('privacyConsent', { required: 'You must agree to the privacy policy' })}
                  type="checkbox"
                  id="privacyConsent"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5 flex-shrink-0 cursor-pointer"
                />
                <label htmlFor="privacyConsent" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-800 font-medium">Privacy Policy</Link>
                  {' '}and{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-800 font-medium">Terms of Use</Link>
                </label>
              </div>
              {errors.privacyConsent && (
                <p className="text-xs text-red-500 flex items-center space-x-1">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /><span>{errors.privacyConsent.message}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-blue w-full flex items-center justify-center space-x-2 text-white font-semibold py-2.5 rounded-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <UserPlus className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center">
                Sign in <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </p>
          </div>

          <div className="mt-5 text-center">
            <Link href="/" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
