import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle, 
  Loader, 
  Key, 
  Clock,
  Shield,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthMode } from './AuthContainer';
import Button from '../UI/Button';

interface ForgotPasswordFormProps {
  onSwitchMode: (mode: AuthMode) => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { resetPassword, isOfflineMode } = useAuth();

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
      if (!email.trim()) {
        throw new Error('Email address is required');
      }

      if (!validateEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (isOfflineMode) {
        throw new Error('Password reset is not available in offline mode. Please use demo credentials to sign in.');
      }

      console.log('📧 Starting password reset process...');
      await resetPassword(email);
      setSuccess('Password reset email sent! Check your inbox and follow the instructions to reset your password.');
      setEmailSent(true);
      
      // Start countdown for resend
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Auto switch to signin after 10 seconds
      setTimeout(() => {
        onSwitchMode('signin');
      }, 10000);
      
    } catch (err: any) {
      console.error('❌ Password reset error:', err);
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      await resetPassword(email);
      setSuccess('Password reset email sent again! Please check your inbox.');
      
      // Restart countdown
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to resend email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email.trim() && validateEmail(email);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <Key className="w-8 h-8 text-white" />
        </motion.div>
        <motion.h2 
          className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Reset Password
        </motion.h2>
        <motion.p 
          className="text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {emailSent 
            ? 'Check your email for reset instructions'
            : 'Enter your email address and we\'ll send you instructions to reset your password'
          }
        </motion.p>
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
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
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

      {/* Offline Mode Warning */}
      {isOfflineMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded-r-lg"
        >
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Offline Mode</p>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Password reset is not available in offline mode. Please use demo credentials to sign in.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Form */}
      {!emailSent ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className={`w-full px-4 py-3 pl-11 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 dark:bg-gray-700 dark:text-white ${
                  email && !validateEmail(email) 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300 focus:border-blue-500 dark:border-gray-600'
                }`}
                placeholder="Enter your email address"
                required
                disabled={isLoading || isOfflineMode}
                autoComplete="email"
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              {email && validateEmail(email) && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
              )}
            </div>
            {email && !validateEmail(email) && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">Please enter a valid email address</p>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button 
              type="primary" 
              className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transform hover:scale-[1.02] transition-all duration-200"
              disabled={isLoading || !isFormValid || isOfflineMode}
              loading={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  Sending Email...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Send Reset Email
                </div>
              )}
            </Button>
          </motion.div>
        </form>
      ) : (
        /* Email Sent State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              Email Sent Successfully!
            </h3>
            <p className="text-green-700 dark:text-green-300 mb-4">
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
            
            {/* Resend Button */}
            <Button
              type="secondary"
              onClick={handleResend}
              disabled={countdown > 0 || isLoading}
              className="w-full mb-4"
            >
              {countdown > 0 ? (
                <div className="flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Resend in {countdown}s
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Email
                </div>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-start gap-3">
          <div className="p-1 bg-blue-500 rounded-full mt-0.5">
            <CheckCircle size={12} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
              What happens next:
            </p>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
              <li>• Check your email inbox (and spam folder)</li>
              <li>• Click the reset link in the email</li>
              <li>• Create a new secure password</li>
              <li>• Sign in with your new password</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
      >
        <div className="flex items-start gap-3">
          <div className="p-1 bg-gray-500 rounded-full mt-0.5">
            <Shield size={12} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              🔒 Security Notice
            </p>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p>• Reset links expire in 1 hour for security</p>
              <p>• Only the most recent reset link will work</p>
              <p>• If you didn't request this, you can safely ignore it</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Back to Sign In */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <button
          type="button"
          onClick={() => onSwitchMode('signin')}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium transition-colors group"
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Sign In
        </button>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordForm;