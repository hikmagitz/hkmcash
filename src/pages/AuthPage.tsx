import React, { useState } from 'react';
import { Mail, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle, Loader, Shield, User, Lock, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();

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
    return errors;
  };

  const getPasswordStrength = (password: string) => {
    const validations = validatePassword(password);
    const strength = 4 - validations.length;
    
    if (strength === 0) return { level: 'Very Weak', color: 'bg-red-500', width: '20%' };
    if (strength === 1) return { level: 'Weak', color: 'bg-orange-500', width: '40%' };
    if (strength === 2) return { level: 'Fair', color: 'bg-yellow-500', width: '60%' };
    if (strength === 3) return { level: 'Good', color: 'bg-blue-500', width: '80%' };
    return { level: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Validation
      if (!formData.email.trim()) {
        throw new Error('Email address is required');
      }

      if (!validateEmail(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (mode === 'forgot') {
        await resetPassword(formData.email);
        setSuccess('Password reset email sent! Check your inbox and follow the instructions.');
        setTimeout(() => {
          setMode('signin');
          setSuccess('');
        }, 5000);
        return;
      }

      if (!formData.password.trim()) {
        throw new Error('Password is required');
      }

      if (mode === 'signup') {
        const passwordErrors = validatePassword(formData.password);
        if (passwordErrors.length > 0) {
          throw new Error(`Password must have: ${passwordErrors.join(', ')}`);
        }

        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        await signUp(formData.email, formData.password);
        setSuccess('Account created successfully! Please check your email to verify your account.');
        
        // Auto switch to signin after 3 seconds
        setTimeout(() => {
          setMode('signin');
          setSuccess('');
          setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        }, 3000);
      } else if (mode === 'signin') {
        await signIn(formData.email, formData.password);
        setSuccess('Welcome back! Redirecting to your dashboard...');
      }

    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setFormData({ email: formData.email, password: '', confirmPassword: '' });
  };

  const getConfig = () => {
    switch (mode) {
      case 'signin':
        return {
          title: 'Welcome Back',
          subtitle: 'Sign in to access your financial dashboard',
          buttonText: 'Sign In',
          loadingText: 'Signing In...',
          icon: <User className="w-8 h-8 text-white" />,
          gradient: 'from-blue-500 to-purple-500'
        };
      case 'signup':
        return {
          title: 'Create Account',
          subtitle: 'Join HKM Cash to start tracking your finances',
          buttonText: 'Create Account',
          loadingText: 'Creating Account...',
          icon: <Shield className="w-8 h-8 text-white" />,
          gradient: 'from-green-500 to-blue-500'
        };
      case 'forgot':
        return {
          title: 'Reset Password',
          subtitle: 'Enter your email to receive reset instructions',
          buttonText: 'Send Reset Email',
          loadingText: 'Sending Email...',
          icon: <Key className="w-8 h-8 text-white" />,
          gradient: 'from-orange-500 to-red-500'
        };
      default:
        return {
          title: 'Welcome',
          subtitle: '',
          buttonText: 'Continue',
          loadingText: 'Loading...',
          icon: <Lock className="w-8 h-8 text-white" />,
          gradient: 'from-gray-500 to-gray-600'
        };
    }
  };

  const config = getConfig();
  const isFormValid = () => {
    if (mode === 'forgot') {
      return formData.email.trim() && validateEmail(formData.email);
    }
    if (mode === 'signup') {
      return formData.email.trim() && 
             formData.password.trim() && 
             formData.confirmPassword.trim() &&
             validateEmail(formData.email) &&
             formData.password === formData.confirmPassword &&
             validatePassword(formData.password).length === 0;
    }
    return formData.email.trim() && formData.password.trim() && validateEmail(formData.email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 px-4 py-8">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 bg-gradient-to-r ${config.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-105 transition-all duration-300`}>
            {config.icon}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {config.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {config.subtitle}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg animate-slide-up">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r-lg animate-slide-up">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Success</p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-4 pl-12 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 dark:bg-gray-700 dark:text-white ${
                  formData.email && !validateEmail(formData.email) 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300 focus:border-blue-500 dark:border-gray-600'
                }`}
                placeholder="Enter your email address"
                required
                disabled={isLoading}
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
              />
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              {formData.email && validateEmail(formData.email) && (
                <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
              )}
            </div>
            {formData.email && !validateEmail(formData.email) && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">Please enter a valid email address</p>
            )}
          </div>

          {/* Password Field */}
          {mode !== 'forgot' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-4 py-4 pr-12 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                  placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter your password'}
                  required
                  disabled={isLoading}
                  minLength={mode === 'signup' ? 8 : 6}
                  autoComplete={mode === 'signin' ? "current-password" : "new-password"}
                  autoCapitalize="none"
                  autoCorrect="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator for Signup */}
              {mode === 'signup' && formData.password && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Password strength:
                    </span>
                    <span className={`text-xs font-bold ${
                      getPasswordStrength(formData.password).level === 'Strong' ? 'text-green-600' :
                      getPasswordStrength(formData.password).level === 'Good' ? 'text-blue-600' :
                      getPasswordStrength(formData.password).level === 'Fair' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {getPasswordStrength(formData.password).level}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(formData.password).color}`}
                      style={{ width: getPasswordStrength(formData.password).width }}
                    />
                  </div>
                  {validatePassword(formData.password).length > 0 && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      <p className="font-medium mb-1">Password must include:</p>
                      <ul className="space-y-1">
                        {validatePassword(formData.password).map((req, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Confirm Password Field */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`w-full px-4 py-4 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 dark:bg-gray-700 dark:text-white ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-300 focus:border-blue-500 dark:border-gray-600'
                  }`}
                  placeholder="Confirm your password"
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <CheckCircle className="absolute right-12 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                )}
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">Passwords do not match</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="primary" 
            className={`w-full py-4 text-lg font-semibold bg-gradient-to-r ${config.gradient} hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-200`}
            disabled={isLoading || !isFormValid()}
            loading={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader className="w-5 h-5 animate-spin mr-3" />
                {config.loadingText}
              </div>
            ) : (
              config.buttonText
            )}
          </Button>

          {/* Navigation Links */}
          <div className="space-y-4 pt-4">
            {mode === 'forgot' ? (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium transition-colors group"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Sign In
                </button>
              </div>
            ) : (
              <>
                {mode === 'signin' && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium transition-colors hover:underline"
                      disabled={isLoading}
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                    <button
                      type="button"
                      onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                      className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-semibold transition-colors hover:underline"
                      disabled={isLoading}
                    >
                      {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>
        </form>

        {/* Quick Test Account (Development Only) */}
        {import.meta.env.DEV && mode === 'signin' && (
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300 mb-3 font-semibold">🧪 Development Mode:</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    email: 'test@example.com',
                    password: 'password123',
                    confirmPassword: ''
                  });
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline block w-full text-left p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                disabled={isLoading}
              >
                📝 Fill test credentials (test@example.com)
              </button>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                💡 Or create a new account with any email/password
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Your data is protected with bank-level encryption
            </span>
          </div>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AuthPage;