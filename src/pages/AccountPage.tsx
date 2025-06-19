import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Lock, 
  Mail, 
  LogOut, 
  Shield, 
  Crown, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  AlertTriangle,
  Settings,
  Sparkles,
  Calendar,
  CreditCard,
  Key,
  Save,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { useIntl } from 'react-intl';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import { useAuth } from '../context/AuthContext';
import { STRIPE_PRODUCTS } from '../stripe-config';

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, updatePassword, resetPassword, isPremium } = useAuth();
  const intl = useIntl();
  
  // Loading states
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  // Password reset state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  
  // Account info state
  const [accountInfo, setAccountInfo] = useState({
    email: '',
    createdAt: '',
    lastSignIn: '',
  });

  // Initialize account info
  useEffect(() => {
    if (user) {
      setAccountInfo({
        email: user.email || '',
        createdAt: user.created_at || '',
        lastSignIn: user.last_sign_in_at || '',
      });
      setResetEmail(user.email || '');
    }
  }, [user]);

  const setLoading = (key: string, value: boolean) => {
    setIsLoading(prev => ({ ...prev, [key]: value }));
  };

  // Password validation
  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    return errors;
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordSuccess(false);
    
    // Validation
    const errors: Record<string, string> = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else {
      const passwordValidation = validatePassword(passwordData.newPassword);
      if (passwordValidation.length > 0) {
        errors.newPassword = passwordValidation.join(', ');
      }
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    setLoading('changePassword', true);
    try {
      await updatePassword(passwordData.newPassword);
      
      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 5000);
    } catch (error: any) {
      console.error('Password change error:', error);
      setPasswordErrors({ 
        general: error.message || 'Failed to change password. Please check your current password and try again.' 
      });
    } finally {
      setLoading('changePassword', false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess(false);
    
    if (!resetEmail) {
      setResetError('Email is required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      setResetError('Please enter a valid email address');
      return;
    }
    
    setLoading('resetPassword', true);
    try {
      await resetPassword(resetEmail);
      
      setResetSuccess(true);
      // Auto-hide success message after 10 seconds
      setTimeout(() => {
        setResetSuccess(false);
      }, 10000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setResetError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading('resetPassword', false);
    }
  };

  // Handle logout with confirmation
  const handleLogout = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to log out? You will need to sign in again to access your account.'
    );
    
    if (!confirmed) return;
    
    setLoading('logout', true);
    try {
      await signOut();
      // Navigation will be handled automatically by AuthContext
    } catch (error: any) {
      console.error('Logout error:', error);
      alert('Failed to log out. Please try again.');
    } finally {
      setLoading('logout', false);
    }
  };

  // Handle premium upgrade
  const handleUpgradeClick = () => {
    navigate('/premium');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(intl.locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  return (
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
                    Mon Compte
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gérez vos paramètres de compte et sécurité
                  </p>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Connecté
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Account Information */}
          <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all hover:scale-110">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Informations du Compte
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Détails de votre profil
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border-l-4 border-blue-500 hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      Adresse Email
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">
                    {accountInfo.email}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 rounded-xl border-l-4 border-green-500 hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                      Membre depuis
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">
                    {formatDate(accountInfo.createdAt)}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border-l-4 border-purple-500 hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                      Dernière connexion
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">
                    {formatDate(accountInfo.lastSignIn)}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-800/20 rounded-xl border-l-4 border-yellow-500 hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4 text-yellow-600" />
                    <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">
                      Statut du compte
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      type="neutral" 
                      className={`${isPremium 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      } shadow-md`}
                    >
                      {isPremium ? (
                        <>
                          <Crown size={14} className="mr-1" />
                          {STRIPE_PRODUCTS.premium_access.name}
                        </>
                      ) : (
                        'Compte Gratuit'
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Password Change */}
          <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all hover:scale-110">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Changer le Mot de Passe
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mettez à jour votre mot de passe
                  </p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                {passwordErrors.general && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-slide-up">
                    <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                      <AlertTriangle size={16} />
                      {passwordErrors.general}
                    </p>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-slide-up">
                    <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                      <CheckCircle size={16} />
                      Mot de passe changé avec succès !
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all ${
                        passwordErrors.currentPassword ? 'border-red-300' : 'border-green-300'
                      }`}
                      placeholder="Entrez votre mot de passe actuel"
                      disabled={isLoading.changePassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      disabled={isLoading.changePassword}
                    >
                      {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-500">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all ${
                        passwordErrors.newPassword ? 'border-red-300' : 'border-green-300'
                      }`}
                      placeholder="Entrez votre nouveau mot de passe"
                      disabled={isLoading.changePassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      disabled={isLoading.changePassword}
                    >
                      {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  
                  {passwordData.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          Force du mot de passe:
                        </span>
                        <span className={`text-xs font-bold ${
                          getPasswordStrength(passwordData.newPassword).level === 'Strong' ? 'text-green-600' :
                          getPasswordStrength(passwordData.newPassword).level === 'Good' ? 'text-blue-600' :
                          getPasswordStrength(passwordData.newPassword).level === 'Fair' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {getPasswordStrength(passwordData.newPassword).level}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(passwordData.newPassword).color}`}
                          style={{ width: getPasswordStrength(passwordData.newPassword).width }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-500">{passwordErrors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all ${
                        passwordErrors.confirmPassword ? 'border-red-300' : 'border-green-300'
                      }`}
                      placeholder="Confirmez votre nouveau mot de passe"
                      disabled={isLoading.changePassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      disabled={isLoading.changePassword}
                    >
                      {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                <Button
                  type="primary"
                  className="w-full group-hover:scale-105 transition-transform"
                  loading={isLoading.changePassword}
                  disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                >
                  <Save size={18} />
                  {isLoading.changePassword ? 'Changement en cours...' : 'Changer le Mot de Passe'}
                </Button>
              </form>
            </div>
          </Card>

          {/* Password Reset */}
          <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all hover:scale-110">
                  <RefreshCw className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Réinitialiser le Mot de Passe
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mot de passe oublié ?
                  </p>
                </div>
              </div>

              <form onSubmit={handlePasswordReset} className="space-y-4">
                {resetError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-slide-up">
                    <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                      <AlertTriangle size={16} />
                      {resetError}
                    </p>
                  </div>
                )}

                {resetSuccess && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-slide-up">
                    <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                      <CheckCircle size={16} />
                      Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                    placeholder="Entrez votre adresse email"
                    disabled={isLoading.resetPassword}
                  />
                </div>

                <Button
                  type="secondary"
                  className="w-full group-hover:scale-105 transition-transform border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-900/20"
                  loading={isLoading.resetPassword}
                  disabled={!resetEmail}
                >
                  <Mail size={18} />
                  {isLoading.resetPassword ? 'Envoi en cours...' : "Envoyer l'Email de Réinitialisation"}
                </Button>
              </form>

              <div className="mt-6 p-3 bg-gradient-to-r from-orange-50/50 to-orange-100/50 dark:from-orange-900/10 dark:to-orange-800/10 rounded-lg border border-orange-200/50 dark:border-orange-800/50">
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-orange-500 rounded-full mt-0.5">
                    <Check size={10} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-1">
                      Instructions :
                    </p>
                    <ul className="text-xs text-orange-600 dark:text-orange-400 space-y-0.5">
                      <li>• Vérifiez votre boîte de réception</li>
                      <li>• Cliquez sur le lien dans l'email</li>
                      <li>• Créez un nouveau mot de passe</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Account Actions */}
          <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all hover:scale-110">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    Actions du Compte
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gérer votre session
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3 mb-3">
                    <LogOut className="w-5 h-5 text-red-600" />
                    <div>
                      <h3 className="font-semibold text-red-800 dark:text-red-200">
                        Se Déconnecter
                      </h3>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Terminer votre session actuelle
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    type="danger"
                    onClick={handleLogout}
                    loading={isLoading.logout}
                    className="w-full hover:scale-105 transition-transform"
                  >
                    <LogOut size={18} />
                    {isLoading.logout ? 'Déconnexion...' : 'Se Déconnecter'}
                  </Button>
                </div>

                {!isPremium && (
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Crown className="w-5 h-5 text-yellow-600 animate-pulse" />
                      <div>
                        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                          Passer à Premium
                        </h3>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                          Débloquez toutes les fonctionnalités
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      type="primary"
                      onClick={handleUpgradeClick}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 hover:scale-105 transition-all"
                    >
                      <Crown size={18} />
                      Découvrir Premium
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Security Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Vos données sont protégées par un chiffrement de niveau bancaire
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;