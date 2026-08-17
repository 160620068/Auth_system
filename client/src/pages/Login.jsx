import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OAuthButtons from '../components/OAuthButtons';
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const { login, user, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  // Check URL params for OAuth failure messages
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthError = params.get('error');
    if (oauthError) {
      if (oauthError === 'google_not_configured') {
        setLocalError('Google OAuth is not configured yet. Please add GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET to server/.env');
      } else if (oauthError === 'github_not_configured') {
        setLocalError('GitHub OAuth is not configured yet. Please add GITHUB_CLIENT_ID & GITHUB_CLIENT_SECRET to server/.env');
      } else if (oauthError === 'google_oauth_failed') {
        setLocalError('Google OAuth login failed or was cancelled. Please check credentials in server/.env');
      } else if (oauthError === 'github_oauth_failed') {
        setLocalError('GitHub OAuth login failed or was cancelled. Please check credentials in server/.env');
      } else {
        setLocalError('OAuth authentication error occurred.');
      }
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (localError) setLocalError('');
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.email || !formData.password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(formData);
    setIsSubmitting(false);

    if (result && result.success) {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950 relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Split-Screen Card Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl glass-card relative z-10">
        
        {/* Left Panel: Branding & Welcome Section (Hidden on mobile, visible on lg) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>Production Security Standard</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Secure Full-Stack <br />
                <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                  Authentication
                </span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Welcome back! Authenticate seamlessly using standard credentials or OAuth 2.0 single sign-on providers.
              </p>
            </div>

            {/* Core Security Features Bullet Points */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center space-x-3 text-xs text-slate-300">
                <div className="w-2 h-2 rounded-full bg-sky-400" />
                <span>JWT Token stored in HTTP-Only Cookie</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-300">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Bcrypt Password Encryption (10 Salt Rounds)</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-300">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Google & GitHub OAuth 2.0 Integration</span>
              </div>
            </div>
          </div>

          <div className="pt-8 text-xs text-slate-500 border-t border-slate-800/80">
            &copy; 2026 AuthShield System. Built for high security.
          </div>
        </div>

        {/* Right Panel: Interactive Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-slate-900/60">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to Your Account</h2>
              <p className="text-xs text-slate-400">Choose your preferred login method below</p>
            </div>

            {/* Display Error Message Banner if error occurs */}
            {(localError || error) && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-red-400 text-xs leading-relaxed animate-shake">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{localError || error}</span>
              </div>
            )}

            {/* OAuth Buttons Component */}
            <OAuthButtons />

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase shrink-0">
                Or login with Email
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>

            {/* Standard Email/Password Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-100 placeholder-slate-500 glass-input focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Input with Visibility Toggle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-slate-100 placeholder-slate-500 glass-input focus:outline-none transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-sky-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Register Page */}
            <div className="text-center text-xs text-slate-400 pt-2">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-sky-400 hover:text-sky-300 hover:underline transition-colors">
                Create an account
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
