import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { BookOpen, LogIn, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Login successful!');
      router.push('/resources');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
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

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 relative z-10">
          <div className="bg-white/10 p-2.5 rounded-xl">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl">EduShare Sierra Leone</span>
        </Link>

        {/* Main copy */}
        <div className="relative z-10 max-w-sm">
          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Welcome back to the community
          </h1>
          <p className="text-blue-200 text-lg mb-8 leading-relaxed">
            Access thousands of educational resources shared by educators across Sierra Leone.
          </p>
          <div className="space-y-3">
            {[
              'Access past papers and study materials',
              'Share resources with the community',
              'Collaborate with educators nationwide',
            ].map((item) => (
              <div key={item} className="glass rounded-xl px-4 py-3 flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" />
                <span className="text-blue-100 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-400 text-sm relative z-10">© 2026 EduShare Sierra Leone</p>
      </div>

      {/* Right – Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">

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
              <h2 className="text-3xl font-extrabold text-slate-900 mb-1">Sign in</h2>
              <p className="text-slate-500">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-semibold text-slate-700">Password</label>
                  <Link href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    {...register('password', { required: 'Password is required' })}
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
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.password.message}</span>
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2 text-white font-semibold py-3.5 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <LogIn className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-500 text-sm">
                Don't have an account?{' '}
                <Link href="/register" className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center">
                  Create account
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
