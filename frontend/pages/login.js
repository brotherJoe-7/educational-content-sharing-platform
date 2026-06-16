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
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);

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

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail || !forgotPasswordEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setLoading(true);
    // Simulate API call for sending reset email
    setTimeout(() => {
      setLoading(false);
      toast.success('Password reset instructions sent to your email!');
      setIsForgotPasswordMode(false);
      setForgotPasswordEmail('');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-gray-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .btn-blue { background: #2563eb; transition: background 0.15s; }
        .btn-blue:hover { background: #1d4ed8; }
        .input-field { transition: border-color 0.15s, box-shadow 0.15s; border: 1px solid #e5e7eb; }
        .input-field:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
      `}} />

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gray-900 flex-col justify-between p-12">
        <Link href="/" className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-blue-400" />
          <span className="text-white font-bold">Open Content Sierra Leone</span>
        </Link>

        <div>
          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Welcome back to the community
          </h1>
          <p className="text-gray-400 text-base mb-8 leading-relaxed">
            Access thousands of educational resources shared by educators across Sierra Leone.
          </p>
          <ul className="space-y-3">
            {[
              'Access past papers and study materials',
              'Share resources with the community',
              'Collaborate with educators nationwide',
            ].map((item) => (
              <li key={item} className="flex items-start space-x-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-gray-600 text-sm">© 2026 Open Content Sierra Leone</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center space-x-2 mb-8 justify-center">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-gray-900">Open Content Sierra Leone</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            {isForgotPasswordMode ? (
              <div>
                <div className="mb-7">
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Reset Password</h2>
                  <p className="text-gray-500 text-sm">Enter your email to receive reset instructions</p>
                </div>
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        className="input-field w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-gray-900 text-sm"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-blue w-full flex items-center justify-center space-x-2 text-white font-semibold py-2.5 rounded-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>Send Reset Link</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordMode(false)}
                      className="w-full py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <div className="mb-7">
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Sign in</h2>
                  <p className="text-gray-500 text-sm">Enter your credentials to continue</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{errors.email.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="block text-sm font-semibold text-gray-700">Password</label>
                      <button type="button" onClick={() => setIsForgotPasswordMode(true)} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Forgot password?</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        {...register('password', { required: 'Password is required' })}
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
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{errors.password.message}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-blue w-full flex items-center justify-center space-x-2 text-white font-semibold py-2.5 rounded-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed"
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

                <p className="mt-6 text-center text-sm text-gray-500">
                  Don't have an account?{' '}
                  <Link href="/register" className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center">
                    Create account <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </p>
              </>
            )}
          </div>

          <div className="mt-5 text-center">
            <Link href="/" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
