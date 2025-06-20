import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle, 
  CheckCircle, 
  Loader, 
  Wifi, 
  WifiOff, 
  User,
  Shield,
  Zap,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthMode } from './AuthContainer';
import Button from '../UI/Button';
import SocialAuth from './SocialAuth';

interface SignInFormProps {
  onSwitchMode: (mode: AuthMode) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSwitchMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  const { signIn, isOfflineMode, connectionStatus } = useAuth();

  // Demo users for offline mode
  const demoUsers = [
    { 
      email: 'demo@example.com', 
      password: 'demo123', 
      name: 'Demo User', 
      role: 'Premium User',
      description: 'Full access to all features'
    },
    { 
      email: 'admin@hkmcash.com', 
      password: 'admin123', 
      name: 'Admin User', 
      role: 'Administrator',
      description: 'Complete system access'
    },
    { 
      email: 'user@test.com', 
      password: 'test123', 
      name: 'Test User', 
      role: 'Free User',
      description: 'Basic features only'
    },
  ];

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (!formData.email.trim()) {
        throw new Error('Email address is required');
      }

      if (!validateEmail(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!formData.password.trim()) {
        throw new Error('Password is required');
      }

      console.log('🔐 Starting sign in process...');
      await signIn(formData.email, formData.password);
      setSuccess('Welcome back! Redirecting to your dashboard...');
      
      // Auto redirect after success
      setTimeout(() => {
        // The AuthContext will handle the redirect
      }, 1500);
      
    } catch (err: any) {
      console.error('❌ Sign in error:', err);
      setError(err.message || 'Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const isFormValid = formData.email.trim() && formData.password.trim() && validateEmail(formData.email);

  // Fill demo credentials
  const fillDemoCredentials = (demoUser: typeof demoUsers[0]) => {
    setFormData(prev => ({
      ...prev,
      email: demoUser.email,
      password: demoUser.password
    }));
    setShowDemoUsers(false);
  };

  // Quick fill for first demo user
  const quickFillDemo = () => {
    fillDemoCredentials(demoUsers[0]);
  };

  // Connection status indicator
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'online': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'offline': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'checking': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'online': return <Wifi size={12} />;
      case 'offline': return <WifiOff size={12} />;
      case 'checking': return <RefreshCw size={12} className="animate-spin" />;
      default: return <WifiOff size={12} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <Shield className="w-8 h-8 text-white" />
        </motion.div>
        
        <motion.h2 
          className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Welcome Back
        </motion.h2>
        <motion.p 
          className="text-gray-600 dark:text-gray-400 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Sign in to access your financial dashboard
        </motion.p>
        
        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getConnectionStatusColor()}`}
        >
          {getConnectionIcon()}
          <span className="capitalize">{connectionStatus}</span>
          {connectionStatus === 'online' && <span>• Secure Connection</span>}
          {connectionStatus === 'offline' && <span>• Demo Mode</span>}
        </motion.div>
      </div>

      {/* Alerts */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg"
        >
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Authentication Error</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r-lg"
        >
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">Success</p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">{success}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Social Auth - Only show in online mode */}
      {!isOfflineMode && <SocialAuth mode="signin" />}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            {isOfflineMode ? 'Demo Login' : 'Or continue with email'}
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 pl-11 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 dark:bg-gray-700 dark:text-white ${
                formData.email && !validateEmail(formData.email) 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-300 focus:border-blue-500 dark:border-gray-600'
              }`}
              placeholder={isOfflineMode ? 'demo@example.com' : 'Enter your email address'}
              required
              disabled={isLoading}
              autoComplete="email"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            {formData.email && validateEmail(formData.email) && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
            )}
          </div>
        </motion.div>

        {/* Password Field */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-4 py-3 pl-11 pr-11 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              placeholder={isOfflineMode ? 'demo123' : 'Enter your password'}
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>

        {/* Remember Me & Forgot Password */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-between"
        >
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
          </label>
          {!isOfflineMode && (
            <button
              type="button"
              onClick={() => onSwitchMode('forgot')}
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium transition-colors hover:underline"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          )}
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button 
            type="primary" 
            className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200"
            disabled={isLoading || !isFormValid}
            loading={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader className="w-5 h-5 animate-spin mr-2" />
                Signing In...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </div>
            )}
          </Button>
        </motion.div>
      </form>

      {/* Demo Users Section for Offline Mode */}
      {isOfflineMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="space-y-4"
        >
          {/* Quick Demo Button */}
          <Button
            type="secondary"
            onClick={quickFillDemo}
            className="w-full bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 hover:from-blue-100 hover:to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 dark:text-blue-300 dark:border-blue-800"
            disabled={isLoading}
          >
            <Zap className="w-4 h-4 mr-2" />
            Quick Demo Login
          </Button>

          {/* Demo Users Toggle */}
          <button
            type="button"
            onClick={() => setShowDemoUsers(!showDemoUsers)}
            className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            disabled={isLoading}
          >
            {showDemoUsers ? 'Hide' : 'Show'} all demo accounts
          </button>

          {/* Demo Users List */}
          {showDemoUsers && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {demoUsers.map((user, index) => (
                <motion.div
                  key={user.email}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => fillDemoCredentials(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{user.role}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Switch to Sign Up */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="text-center pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => onSwitchMode('signup')}
            className={`font-semibold transition-colors hover:underline ${
              isOfflineMode 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-600 hover:text-blue-500 dark:text-blue-400'
            }`}
            disabled={isLoading || isOfflineMode}
          >
            {isOfflineMode ? 'Sign Up (Online Only)' : 'Sign Up'}
          </button>
        </p>
      </motion.div>

      {/* Offline Mode Info */}
      {isOfflineMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800"
        >
          <div className="flex items-start gap-3">
            <div className="p-1 bg-orange-500 rounded-full mt-0.5">
              <WifiOff size={12} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                🔧 Offline Demo Mode Active
              </p>
              <div className="text-xs text-orange-600 dark:text-orange-400 space-y-1">
                <p>• ✅ All app features available</p>
                <p>• ✅ Local data storage</p>
                <p>• ❌ No cloud synchronization</p>
                <p>• ❌ No real authentication</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Environment Status for Development */}
      {import.meta.env.DEV && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 font-semibold">🧪 Development Status:</p>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <p>• Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}</p>
            <p>• Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}</p>
            <p>• Connection: {connectionStatus}</p>
            <p>• Mode: {isOfflineMode ? 'Offline Demo' : 'Online Production'}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SignInForm;