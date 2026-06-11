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
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        .auth-gradient { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%); }
        .btn-primary { background: linear-gradient(135deg, #2563eb, #1d4ed8); transition: all 0.3s ease; box-shadow: 0 4px 20px rgba(37,99,235,0.4); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(37,99,235,0.5); }
        .input-field { transition: all 0.2s ease; }
        .input-field:focus { box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
        .glass { background: rgba(255,255,255,0.08); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.15); }
      `}</style>

      {/* Left – Branding */}
      <div className="hidden lg:flex lg:w-1/2 auth-gradient flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400 rounded-full opacity-10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400 rounded-full opacity-10 blur-3xl" />

        <Link href="/" className="flex items-center space-x-3 relative z-10">
          <div className="bg-white/10 p-2.5 rounded-xl">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl">EduShare Sierra Leone</span>
        </Link>

        <div className="relative z-10 max-w-sm">
          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Join Sierra Leone's #1 education platform
          </h1>
          <p className="text-blue-200 text-lg mb-8 leading-relaxed">
            Create a free account and start sharing educational resources with thousands of educators.
          </p>
          <div className="space-y-3">
            {[
              'Upload and share educational materials',
              'Access resources from educators nationwide',
              'Contribute to Sierra Leone\'s education',
            ].map((item) => (
              <div key={item} className="glass rounded-xl px-4 py-3 flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span className="text-blue-100 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-400 text-sm relative z-10">© 2026 EduShare Sierra Leone</p>
      </div>

      {/* Right – Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-md my-8">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-xl">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-slate-900 text-lg">EduShare Sierra Leone</span>
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-1">Create account</h2>
              <p className="text-slate-500">Join our educational community today</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    {...register('name', { required: 'Name is required' })}
                    type="text"
                    className="input-field w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50 text-slate-900"
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-500 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" /><span>{errors.name.message}</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    {...register('email', { required: 'Email is required' })}
                    type="email"
                    className="input-field w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50 text-slate-900"
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-500 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" /><span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="input-field w-full pl-11 pr-12 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50 text-slate-900"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-500 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" /><span>{errors.password.message}</span>
                  </p>
                )}
              </div>

              {/* Privacy consent */}
              <div className="flex items-start space-x-3">
                <input
                  {...register('privacyConsent', { required: 'You must agree to the privacy policy' })}
                  type="checkbox"
                  id="privacyConsent"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded mt-0.5 flex-shrink-0 cursor-pointer"
                />
                <label htmlFor="privacyConsent" className="text-sm text-slate-600">
                  I agree to the{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-800 font-medium">Privacy Policy</Link>
                  {' '}and{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-800 font-medium">Terms of Use</Link>
                </label>
              </div>
              {errors.privacyConsent && (
                <p className="text-sm text-red-500 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" /><span>{errors.privacyConsent.message}</span>
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2 text-white font-semibold py-3.5 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
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

            <div className="mt-8 text-center">
              <p className="text-slate-500 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center">
                  Sign in
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
