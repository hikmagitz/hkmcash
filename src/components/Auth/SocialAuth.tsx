import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Chrome, Github, Apple, AlertCircle, Loader, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../UI/Button';

interface SocialAuthProps {
  mode: 'signin' | 'signup';
}

const SocialAuth: React.FC<SocialAuthProps> = ({ mode }) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { signInWithGoogle, isOfflineMode } = useAuth();

  const handleGoogleAuth = async () => {
    if (isOfflineMode) {
      setError('Google authentication is not available in offline mode');
      return;
    }

    setIsLoading('google');
    setError('');
    
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setIsLoading(null);
    }
  };

  const handleOtherProvider = (provider: string) => {
    if (isOfflineMode) {
      setError(`${provider} authentication is not available in offline mode`);
      return;
    }
    
    // Show coming soon message
    setError(`${provider} authentication will be available soon! Currently only Google authentication is supported.`);
    
    // Clear error after 3 seconds
    setTimeout(() => setError(''), 3000);
  };

  const buttonText = mode === 'signin' ? 'Sign in' : 'Sign up';

  // Don't render social auth in offline mode
  if (isOfflineMode) {
    return null;
  }

  return (
    <div className="space-y-3">
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Enhanced Google Auth Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <button
          onClick={handleGoogleAuth}
          disabled={isLoading === 'google'}
          className="relative w-full py-4 px-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 group overflow-hidden shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-yellow-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Loading State */}
          {isLoading === 'google' && (
            <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 flex items-center justify-center rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 w-6 h-6 border-2 border-transparent border-r-yellow-500 rounded-full animate-spin" style={{ animationDelay: '0.1s' }} />
                  <div className="absolute inset-0 w-6 h-6 border-2 border-transparent border-b-green-500 rounded-full animate-spin" style={{ animationDelay: '0.2s' }} />
                  <div className="absolute inset-0 w-6 h-6 border-2 border-transparent border-l-blue-500 rounded-full animate-spin" style={{ animationDelay: '0.3s' }} />
                </div>
                <span className="text-sm font-medium">Connecting to Google...</span>
              </div>
            </div>
          )}

          {/* Button Content */}
          <div className={`relative flex items-center justify-center space-x-3 ${isLoading === 'google' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
            {/* Google Icon with Animation */}
            <div className="relative">
              <Chrome className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute inset-0 w-6 h-6 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 rounded-full opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300" />
            </div>
            
            {/* Text with Gradient Effect */}
            <span className="text-base font-semibold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-100 bg-clip-text group-hover:from-red-600 group-hover:via-blue-600 group-hover:to-green-600 transition-all duration-300">
              {buttonText} with Google
            </span>
            
            {/* Fast Connection Indicator */}
            <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-medium text-green-600 dark:text-green-400">Fast</span>
            </div>
          </div>

          {/* Shimmer Effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
        </button>
      </motion.div>

      {/* Other Providers */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            type="secondary"
            onClick={() => handleOtherProvider('GitHub')}
            disabled={isLoading !== null}
            className="w-full py-3 border-2 border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/10 to-gray-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-center">
              <Github className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
              <span className="font-medium">GitHub</span>
            </div>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            type="secondary"
            onClick={() => handleOtherProvider('Apple')}
            disabled={isLoading !== null}
            className="w-full py-3 border-2 border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-800/10 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-center">
              <Apple className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
              <span className="font-medium">Apple</span>
            </div>
          </Button>
        </motion.div>
      </div>

      {/* Enhanced Social Auth Benefits */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-green-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
      >
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              Lightning Fast Authentication
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-xs text-blue-600 dark:text-blue-400">
            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-1">
                <Zap className="w-4 h-4 text-green-600" />
              </div>
              <p className="font-medium">1-Click</p>
              <p className="opacity-75">Sign In</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-1">
                <Chrome className="w-4 h-4 text-blue-600" />
              </div>
              <p className="font-medium">Secure</p>
              <p className="opacity-75">OAuth 2.0</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-purple-600 font-bold text-xs">2FA</span>
              </div>
              <p className="font-medium">Protected</p>
              <p className="opacity-75">Account</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SocialAuth;