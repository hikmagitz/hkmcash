import React, { useState, useContext, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Lock, 
  Mail, 
  LogOut, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  AlertTriangle,
  Shield,
  Key,
  Save,
  RefreshCw,
  CheckCircle,
  Loader
} from 'lucide-react';

// Simple Auth Context for demo purposes
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    setUser(null);
    window.location.href = '/login';
  };

  const updatePassword = async (currentPassword, newPassword) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate validation
        if (currentPassword !== 'currentpass123') {
          reject(new Error('Current password is incorrect'));
          return;
        }
        
        // Simulate success
        console.log('Password updated successfully');
        resolve();
      }, 2000);
    });
  };

  const sendPasswordReset = async (email) => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          reject(new Error('Invalid email address'));
          return;
        }
        
        // Simulate success
        console.log(`Password reset email sent to ${email}`);
        resolve();
      }, 1500);
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      logout,
      updatePassword,
      sendPasswordReset
    }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Reusable Card Component
const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-xl ${className}`}>
      {children}
    </div>
  );
};

// Reusable Button Component
const Button = ({ 
  children, 
  type = 'primary', 
  onClick, 
  disabled = false, 
  loading = false, 
  className = '',
  ...props 
}) => {
  const baseClasses = 'relative overflow-hidden font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-lg shadow-sm hover:shadow-lg active:scale-95 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none disabled:shadow-sm px-4 py-2 text-sm md:text-base min-h-[44px]';
  
  const typeClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl focus:ring-blue-500/30',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600 dark:hover:border-gray-500 focus:ring-gray-500/30',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl focus:ring-red-500/30',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl focus:ring-green-500/30',
  };

  return (
    <button
      className={`${baseClasses} ${typeClasses[type]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-lg">
          <Loader className="w-5 h-5 animate-spin" />
        </div>
      )}
      <span className={`relative z-10 flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
    </button>
  );
};

// Password Strength Indicator Component
const PasswordStrengthIndicator = ({ password }) => {
  const getPasswordStrength = (password) => {
    if (!password) return { level: '', color: '', width: '0%' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score === 0) return { level: '', color: '', width: '0%' };
    if (score === 1) return { level: 'Very Weak', color: 'bg-red-500', width: '20%' };
    if (score === 2) return { level: 'Weak', color: 'bg-orange-500', width: '40%' };
    if (score === 3) return { level: 'Fair', color: 'bg-yellow-500', width: '60%' };
    if (score === 4) return { level: 'Good', color: 'bg-blue-500', width: '80%' };
    return { level: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const strength = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Password strength:
        </span>
        <span className={`text-xs font-bold ${
          strength.level === 'Strong' ? 'text-green-600' :
          strength.level === 'Good' ? 'text-blue-600' :
          strength.level === 'Fair' ? 'text-yellow-600' :
          'text-red-600'
        }`}>
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

// Change Password Form Component
const ChangePasswordForm = () => {
  const { updatePassword } = useAuth();
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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    // Validation
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const passwordValidation = validatePassword(formData.newPassword);
      if (passwordValidation.length > 0) {
        newErrors.newPassword = passwordValidation.join(', ');
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
      await updatePassword(formData.currentPassword, formData.newPassword);
      setSuccess(true);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Auto-hide success message
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <Card className="hover:scale-105 transition-transform">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Change Password
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Update your account password
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle size={16} />
              {errors.general}
            </p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
              <CheckCircle size={16} />
              Password changed successfully!
            </p>
          </div>
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
                errors.currentPassword ? 'border-red-300' : 'border-green-300'
              }`}
              placeholder="Enter your current password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              disabled={loading}
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
                errors.newPassword ? 'border-red-300' : 'border-green-300'
              }`}
              placeholder="Enter your new password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              disabled={loading}
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
                errors.confirmPassword ? 'border-red-300' : 'border-green-300'
              }`}
              placeholder="Confirm your new password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              disabled={loading}
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
          disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
        >
          <Save size={18} />
          {loading ? 'Changing Password...' : 'Change Password'}
        </Button>
      </form>
    </Card>
  );
};

// Forgotten Password Form Component
const ForgottenPasswordForm = () => {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('user@example.com'); // Pre-filled for demo
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSuccess(true);
      
      // Auto-hide success message
      setTimeout(() => setSuccess(false), 10000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="hover:scale-105 transition-transform">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
          <RefreshCw className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Forgotten Password
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Reset your password via email
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle size={16} />
              {error}
            </p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
              <CheckCircle size={16} />
              Password reset email sent! Check your inbox.
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
            placeholder="Enter your email address"
            disabled={loading}
          />
        </div>

        <Button
          type="secondary"
          className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20"
          loading={loading}
          disabled={!email}
        >
          <Mail size={18} />
          {loading ? 'Sending Email...' : 'Send Reset Link'}
        </Button>
      </form>

      <div className="mt-6 p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-800">
        <div className="flex items-start gap-2">
          <div className="p-1 bg-orange-500 rounded-full mt-0.5">
            <Check size={10} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-1">
              Instructions:
            </p>
            <ul className="text-xs text-orange-600 dark:text-orange-400 space-y-0.5">
              <li>• Check your email inbox</li>
              <li>• Click the reset link in the email</li>
              <li>• Create a new password</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Logout Section Component
const LogoutSection = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to log out? You will need to sign in again to access your account.'
    );
    
    if (!confirmed) return;
    
    setLoading(true);
    
    // Simulate logout delay
    setTimeout(() => {
      logout();
    }, 1000);
  };

  return (
    <Card className="hover:scale-105 transition-transform">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
          <LogOut className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Account Actions
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your session
          </p>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3 mb-3">
          <LogOut className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-800 dark:text-red-200">
              Sign Out
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400">
              End your current session
            </p>
          </div>
        </div>
        
        <Button
          type="danger"
          onClick={handleLogout}
          loading={loading}
          className="w-full"
        >
          <LogOut size={18} />
          {loading ? 'Signing Out...' : 'Sign Out'}
        </Button>
      </div>
    </Card>
  );
};

// Main Account Settings Page Component
const AccountSettingsPage = () => {
  // Mock user data
  const mockUser = {
    email: 'user@example.com',
    name: 'John Doe',
    joinDate: '2024-01-15'
  };

  // Set mock user in localStorage for demo
  React.useEffect(() => {
    if (!localStorage.getItem('user')) {
      localStorage.setItem('user', JSON.stringify(mockUser));
    }
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Account Settings
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage your account security and preferences
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Secure Connection
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChangePasswordForm />
            <ForgottenPasswordForm />
            <LogoutSection />
            
            {/* Account Info Card */}
            <Card className="hover:scale-105 transition-transform">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Account Information
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your profile details
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      Email Address
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">
                    {mockUser.email}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 rounded-xl border-l-4 border-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                      Account Name
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">
                    {mockUser.name}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border-l-4 border-purple-500">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                      Member Since
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">
                    {new Date(mockUser.joinDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Bottom Security Info */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Your data is protected with bank-level encryption
              </span>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
};

export default AccountSettingsPage;