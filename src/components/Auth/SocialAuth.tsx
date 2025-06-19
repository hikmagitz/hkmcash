import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Chrome, Github, Apple, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../UI/Button';

interface SocialAuthProps {
  mode: 'signin' | 'signup';
}

const SocialAuth: React.FC<SocialAuthProps> = ({ mode }) => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { signInWithGoogle } = useAuth();

  const handleGoogleAuth = async () => {
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
    alert(`${provider} authentication will be available soon!`);
  };

  const buttonText = mode === 'signin' ? 'Sign in' : 'Sign up';

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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Button
          type="secondary"
          onClick={handleGoogleAuth}
          disabled={isLoading === 'google'}
          className="w-full py-3 border-2 border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 relative"
        >
          {isLoading === 'google' ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-3" />
              Connecting...
            </div>
          ) : (
            <>
              <Chrome className="w-5 h-5 mr-3 text-red-500" />
              {buttonText} with Google
            </>
          )}
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            type="secondary"
            onClick={() => handleOtherProvider('GitHub')}
            className="w-full py-3 border-2 border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Github className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
            GitHub
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
            className="w-full py-3 border-2 border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Apple className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
            Apple
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default SocialAuth;