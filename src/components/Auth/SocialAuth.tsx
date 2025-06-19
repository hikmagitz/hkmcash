import React from 'react';
import { motion } from 'framer-motion';
import { Chrome, Github, Apple } from 'lucide-react';
import Button from '../UI/Button';

interface SocialAuthProps {
  mode: 'signin' | 'signup';
}

const SocialAuth: React.FC<SocialAuthProps> = ({ mode }) => {
  const handleSocialAuth = (provider: string) => {
    // This would integrate with your social auth provider
    console.log(`${mode} with ${provider}`);
    // For now, just show an alert
    alert(`${provider} authentication will be implemented with your social auth provider`);
  };

  const buttonText = mode === 'signin' ? 'Sign in' : 'Sign up';

  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Button
          type="secondary"
          onClick={() => handleSocialAuth('Google')}
          className="w-full py-3 border-2 border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <Chrome className="w-5 h-5 mr-3 text-red-500" />
          {buttonText} with Google
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
            onClick={() => handleSocialAuth('GitHub')}
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
            onClick={() => handleSocialAuth('Apple')}
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