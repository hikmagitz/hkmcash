import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Key, 
  Mail, 
  CheckCircle, 
  AlertTriangle, 
  Loader,
  Shield,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../UI/Button';
import Card from '../UI/Card';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const getPasswordStrength = (password: string) => {
    if (!password) return { level: '', color: '', width: '0%', textColor: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score === 0) return { level: '', color: '', width: '0%', textColor: '' };
    if (score === 1) return { level: 'Very Weak', color: 'bg-red-500', width: '20%', textColor: 'text-red-600' };
    if (score === 2) return { level: 'Weak', color: 'bg-orange-500', width: '40%', textColor: 'text-orange-600' };
    if (score === 3) return { level: 'Fair', color: 'bg-yellow-500', width: '60%', textColor: 'text-yellow-600' };
    if (score === 4) return { level: 'Good', color: 'bg-blue-500', width: '80%', textColor: 'text-blue-600' };
    return { level: 'Strong', color: 'bg-green-500', width: '100%', textColor: 'text-green-600' };
  };

  const strength = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Password strength:
        </span>
        <span className={`text-xs font-bold ${strength.textColor}`}>
          {strength.level}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
          style={{ width: strength.width }}
        />
      </div>
    </div>
  );
};

export const ChangePasswordForm: React.FC = () => {
  const { updatePassword, isOfflineMode } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePassword = (password: string): string[] => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    if (!/[^A-Za-z0-9]/.test(password)) errors.push('One special character');
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    if (isOfflineMode) {
      setErrors({ general: 'Password change is not available in offline mode.' });
      return;
    }

    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const passwordValidation = validatePassword(formData.newPassword);
      if (passwordValidation.length > 0) {
        newErrors.newPassword = `Password must have: ${passwordValidation.join(', ')}`;
      }
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await updatePassword(formData.newPassword);
      setSuccess(true);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Auto-hide success message
      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Change Password
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Update your account password for better security
          </p>
        </div>
      </div>

      {isOfflineMode && (
        <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded-r-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Offline Mode</p>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Password changes are not available in offline mode. Please connect to use this feature.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg"
          >
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{errors.general}</p>
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
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">Password changed successfully!</p>
              </div>
            </div>
          </motion.div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
              className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all ${
                errors.currentPassword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your current password"
              disabled={loading || isOfflineMode}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              disabled={loading || isOfflineMode}
            >
              {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
              className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all ${
                errors.newPassword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your new password"
              disabled={loading || isOfflineMode}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              disabled={loading || isOfflineMode}
            >
              {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <PasswordStrengthIndicator password={formData.newPassword} />
          
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all ${
                errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Confirm your new password"
              disabled={loading || isOfflineMode}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              disabled={loading || isOfflineMode}
            >
              {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        <Button
          type="success"
          className="w-full"
          loading={loading}
          disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword || isOfflineMode}
        >
          <Key size={18} />
          {loading ? 'Changing Password...' : 'Change Password'}
        </Button>
      </form>
    </Card>
  );
};

export const ForgotPasswordForm: React.FC = () => {
  const { resetPassword, isOfflineMode } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (isOfflineMode) {
      setError('Password reset is not available in offline mode.');
      return;
    }

    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
      
      // Auto-hide success message
      setTimeout(() => setSuccess(false), 10000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl shadow-lg">
          <RefreshCw className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Reset Password
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Send a password reset link to your email
          </p>
        </div>
      </div>

      {isOfflineMode && (
        <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded-r-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Offline Mode</p>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Password reset is not available in offline mode. Please connect to use this feature.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg"
          >
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
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
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Password reset email sent! Check your inbox and follow the instructions.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 pl-11 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all ${
                email && !validateEmail(email) ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
              disabled={loading || isOfflineMode}
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            {email && validateEmail(email) && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
            )}
          </div>
          {email && !validateEmail(email) && (
            <p className="mt-1 text-sm text-red-500">Please enter a valid email address</p>
          )}
        </div>

        <Button
          type="primary"
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          loading={loading}
          disabled={!email || !validateEmail(email) || isOfflineMode}
        >
          <Mail size={18} />
          {loading ? 'Sending Email...' : 'Send Reset Link'}
        </Button>
      </form>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
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
      </div>

      {/* Security Notice */}
      <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
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
      </div>
    </Card>
  );
};