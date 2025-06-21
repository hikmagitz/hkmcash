import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  AlertCircle, 
  CheckCircle, 
  Loader, 
  User,
  Shield,
  Zap,
  WifiOff,
  Building
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthMode } from './AuthContainer';
import Button from '../UI/Button';
import SocialAuth from './SocialAuth';

interface SignUpFormProps {
  onSwitchMode: (mode: AuthMode) => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSwitchMode }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, isOfflineMode } = useAuth();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): string[] => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    if (!/[^A-Za-z0-9]/.test(password)) errors.push('One special character');
    return errors;
  };

  const getPasswordStrength = (password: string) => {
    const validations = validatePassword(password);
    const strength = 5 - validations.length;
    
    if (strength === 0) return { level: 'Very Weak', color: 'bg-red-500', width: '20%', textColor: 'text-red-600' };
    if (strength === 1) return { level: 'Weak', color: 'bg-orange-500', width: '40%', textColor: 'text-orange-600' };
    if (strength === 2) return { level: 'Fair', color: 'bg-yellow-500', width: '60%', textColor: 'text-yellow-600' };
    if (strength === 3) return { level: 'Good', color: 'bg-blue-500', width: '80%', textColor: 'text-blue-600' };
    if (strength === 4) return { level: 'Strong', color: 'bg-green-500', width: '100%', textColor: 'text-green-600' };
    return { level: 'Very Strong', color: 'bg-emerald-500', width: '100%', textColor: 'text-emerald-600' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Validation
      if (!formData.firstName.trim()) {
        throw new Error('First name is required');
      }

      if (!formData.lastName.trim()) {
        throw new Error('Last name is required');
      }

      if (!formData.email.trim()) {
        throw new Error('Email address is required');
      }

      if (!validateEmail(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!formData.password.trim()) {
        throw new Error('Password is required');
      }

      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        throw new Error(`Password must have: ${passwordErrors.join(', ')}`);
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (!formData.agreeToTerms) {
        throw new Error('Please agree to the Terms of Service and Privacy Policy');
      }

      await signUp(formData.email, formData.password, formData.firstName, formData.lastName);
      setSuccess('Account created successfully! Please check your email to verify your account.');
      
      // Auto switch to signin after 3 seconds
      setTimeout(() => {
        onSwitchMode('signin');
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Account creation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const isFormValid = () => {
    return formData.firstName.trim() && 
           formData.lastName.trim() && 
           formData.email.trim() && 
           formData.password.trim() && 
           formData.confirmPassword.trim() &&
           validateEmail(formData.email) &&
           formData.password === formData.confirmPassword &&
           validatePassword(formData.password).length === 0 &&
           formData.agreeToTerms;
  };

  // If offline mode, show message
  if (isOfflineMode) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <WifiOff className="w-8 h-8 text-white" />
          </motion.div>
          
          <motion.h2 
            className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Sign Up Unavailable
          </motion.h2>
          <motion.p 
            className="text-gray-600 dark:text-gray-400 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Account creation requires an online connection
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-800"
        >
          <div className="text-center">
            <WifiOff className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2">
              Offline Mode Active
            </h3>
            <p className="text-orange-700 dark:text-orange-300 mb-4">
              Sign up requires an internet connection and Supabase configuration. 
              You can use demo accounts to explore the application.
            </p>
            <div className="space-y-2">
              <Button
                type="secondary"
                onClick={() => onSwitchMode('signin')}
                className="w-full bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
              >
                <User className="w-4 h-4 mr-2" />
                Try Demo Accounts
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onSwitchMode('signin')}
              className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-semibold transition-colors hover:underline"
            >
              Sign In
            </button>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <UserPlus className="w-8 h-8 text-white" />
        </motion.div>
        
        <motion.h2 
          className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Create Account
        </motion.h2>
        <motion.p 
          className="text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Join HKM Cash to start tracking your finances
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
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Registration Error</p>
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

      {/* Social Auth */}
      <SocialAuth mode="signup" />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            Or create account with email
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              First Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-4 py-3 pl-11 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                placeholder="First name"
                required
                disabled={isLoading}
                autoComplete="given-name"
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Last Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-4 py-3 pl-11 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                placeholder="Last name"
                required
                disabled={isLoading}
                autoComplete="family-name"
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </motion.div>
        </div>

        {/* Company Name Field */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45 }}
        >
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Company Name <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className="w-full px-4 py-3 pl-11 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              placeholder="Your company name"
              disabled={isLoading}
              autoComplete="organization"
            />
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </motion.div>

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
              className={`w-full px-4 py-3 pl-11 border-2 rounded-xl focus:ring-4 focus:ring-pink-500/20 transition-all duration-200 dark:bg-gray-700 dark:text-white ${
                formData.email && !validateEmail(formData.email) 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-300 focus:border-pink-500 dark:border-gray-600'
              }`}
              placeholder="Enter your email address"
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
              className="w-full px-4 py-3 pl-11 pr-11 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              placeholder="Create a strong password"
              required
              disabled={isLoading}
              autoComplete="new-password"
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
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Password strength:
                </span>
                <span className={`text-xs font-bold ${getPasswordStrength(formData.password).textColor}`}>
                  {getPasswordStrength(formData.password).level}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(formData.password).color}`}
                  style={{ width: getPasswordStrength(formData.password).width }}
                />
              </div>
              
              {/* Password Requirements */}
              {validatePassword(formData.password).length > 0 && (
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  <p className="mb-1">Password must include:</p>
                  <ul className="space-y-1">
                    {validatePassword(formData.password).map((req, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <span className="text-red-500">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Confirm Password Field */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full px-4 py-3 pl-11 pr-11 border-2 rounded-xl focus:ring-4 focus:ring-pink-500/20 transition-all duration-200 dark:bg-gray-700 dark:text-white ${
                formData.confirmPassword && formData.password !== formData.confirmPassword
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-300 focus:border-pink-500 dark:border-gray-600'
              }`}
              placeholder="Confirm your password"
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <CheckCircle className="absolute right-12 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
            )}
          </div>
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">Passwords do not match</p>
          )}
        </motion.div>

        {/* Terms Agreement */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="flex items-start"
        >
          <input
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500 focus:ring-2 mt-1"
            disabled={isLoading}
            required
          />
          <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
            I agree to the{' '}
            <a href="#" className="text-pink-600 hover:text-pink-500 dark:text-pink-400 hover:underline font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-pink-600 hover:text-pink-500 dark:text-pink-400 hover:underline font-medium">
              Privacy Policy
            </a>
          </span>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <button
            type="submit"
            disabled={isLoading || !isFormValid()}
            className={`w-full py-3 text-lg font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 min-h-[52px] relative overflow-hidden ${
              isLoading || !isFormValid()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-4 focus:ring-pink-500/30'
            }`}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <span className={`relative z-10 flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
              <UserPlus className="w-5 h-5" />
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </span>
          </button>
        </motion.div>
      </form>

      {/* Switch to Sign In */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="text-center pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onSwitchMode('signin')}
            className="text-pink-600 hover:text-pink-500 dark:text-pink-400 font-semibold transition-colors hover:underline"
            disabled={isLoading}
          >
            Sign In
          </button>
        </p>
      </motion.div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-start gap-3">
          <div className="p-1 bg-blue-500 rounded-full mt-0.5">
            <Shield size={12} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
              🔒 Your data is secure
            </p>
            <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <p>• End-to-end encryption</p>
              <p>• GDPR compliant</p>
              <p>• No data sharing with third parties</p>
              <p>• Regular security audits</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpForm;