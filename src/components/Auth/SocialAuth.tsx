import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Chrome, Github, Apple, AlertCircle, Loader } from 'lucide-react';
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

      {/* Google Auth */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Button
          type="secondary"
          onClick={handleGoogleAuth}
          disabled={isLoading === 'google'}
          className="w-full py-3 border-2 border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 relative overflow-hidden group"
        >
          {isLoading === 'google' ? (
            <div className="flex items-center justify-center">
              <Loader className="w-5 h-5 animate-spin mr-3 text-blue-500" />
              <span>Connecting to Google...</span>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center">
                <Chrome className="w-5 h-5 mr-3 text-red-500" />
                <span className="font-medium">{buttonText} with Google</span>
              </div>
            </>
          )}
        </Button>
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

      {/* Social Auth Benefits */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
      >
        <div className="text-center">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
            🚀 Quick & Secure
          </p>
          <div className="text-xs text-blue-600 dark:text-blue-400 space-y-0.5">
            <p>• No password to remember</p>
            <p>• Instant account setup</p>
            <p>• Enhanced security with 2FA</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SocialAuth;