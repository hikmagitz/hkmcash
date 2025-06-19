import React, { useState } from 'react';
import { Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (isForgotPassword) {
        // Handle password reset
        if (!email) {
          setError('Please enter your email address');
          return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          setError('Please enter a valid email address');
          return;
        }

        await resetPassword(email);
        setSuccess('Password reset email sent! Check your inbox and follow the instructions.');
        
        // Auto switch back to login after 3 seconds
        setTimeout(() => {
          setIsForgotPassword(false);
          setSuccess('');
        }, 5000);
      } else {
        // Handle login/signup
        if (!email || !password) {
          setError('Please fill in all fields');
          return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          setError('Please enter a valid email address');
          return;
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters long');
          return;
        }

        if (isLogin) {
          await signIn(email, password);
        } else {
          await signUp(email, password);
          setSuccess('Account created successfully! Please check your email to verify your account.');
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      
      // Handle specific error messages
      if (err.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Please check your email and click the confirmation link before signing in.');
      } else if (err.message?.includes('User already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeSwitch = (newMode: 'login' | 'signup' | 'forgot') => {
    setError('');
    setSuccess('');
    
    if (newMode === 'forgot') {
      setIsForgotPassword(true);
    } else {
      setIsForgotPassword(false);
      setIsLogin(newMode === 'login');
    }
  };

  const getTitle = () => {
    if (isForgotPassword) return 'Reset Password';
    return isLogin ? 'Welcome Back' : 'Create Account';
  };

  const getSubtitle = () => {
    if (isForgotPassword) return 'Enter your email to receive reset instructions';
    return isLogin ? 'Sign in to your account' : 'Join HKM Cash today';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {getTitle()}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {getSubtitle()}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          {!isForgotPassword && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          <Button 
            type="primary" 
            className="w-full"
            disabled={isLoading || !email || (!isForgotPassword && !password)}
            loading={isLoading}
          >
            {isLoading ? (
              isForgotPassword ? 'Sending Reset Email...' : 
              isLogin ? 'Signing In...' : 'Creating Account...'
            ) : (
              isForgotPassword ? 'Send Reset Email' :
              isLogin ? 'Sign In' : 'Sign Up'
            )}
          </Button>

          {/* Navigation Links */}
          <div className="space-y-3">
            {isForgotPassword ? (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => handleModeSwitch('login')}
                  className="inline-flex items-center text-sm text-sky-600 hover:text-sky-500 dark:text-sky-400 font-medium transition-colors"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Sign In
                </button>
              </div>
            ) : (
              <>
                {isLogin && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => handleModeSwitch('forgot')}
                      className="text-sm text-sky-600 hover:text-sky-500 dark:text-sky-400 font-medium transition-colors"
                      disabled={isLoading}
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                      type="button"
                      onClick={() => handleModeSwitch(isLogin ? 'signup' : 'login')}
                      className="text-sky-600 hover:text-sky-500 dark:text-sky-400 font-medium transition-colors"
                      disabled={isLoading}
                    >
                      {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AuthPage;