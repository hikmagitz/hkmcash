import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import { Shield, Sparkles, AlertTriangle, Wifi, WifiOff, RefreshCw, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type AuthMode = 'signin' | 'signup' | 'forgot';

const AuthContainer: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [showConnectionHelp, setShowConnectionHelp] = useState(false);
  const { connectionStatus, isOfflineMode, switchToOfflineMode } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  const backgroundVariants = {
    signin: { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    signup: { background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    forgot: { background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }
  };

  // Show connection help if there are connection issues
  useEffect(() => {
    if (connectionStatus === 'offline' && !isOfflineMode) {
      setShowConnectionHelp(true);
    }
  }, [connectionStatus, isOfflineMode]);

  const handleSwitchToOffline = () => {
    switchToOfflineMode();
    setShowConnectionHelp(false);
  };

  const handleRetryConnection = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        animate={backgroundVariants[mode]}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4">HKM Cash</h1>
            <p className="text-xl opacity-90 mb-8 max-w-md">
              Take control of your finances with our intelligent money management platform
            </p>
            
            {/* Connection Status Indicator */}
            <div className="mb-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md ${
                connectionStatus === 'online' ? 'bg-green-500/20 border border-green-400/30' :
                connectionStatus === 'offline' ? 'bg-orange-500/20 border border-orange-400/30' :
                'bg-blue-500/20 border border-blue-400/30'
              }`}>
                {connectionStatus === 'online' && <Wifi className="w-4 h-4" />}
                {connectionStatus === 'offline' && <WifiOff className="w-4 h-4" />}
                {connectionStatus === 'checking' && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span className="text-sm font-medium capitalize">
                  {connectionStatus === 'online' && 'Connected'}
                  {connectionStatus === 'offline' && (isOfflineMode ? 'Demo Mode' : 'Connection Issue')}
                  {connectionStatus === 'checking' && 'Connecting...'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">50K+</div>
                <div className="opacity-80">Active Users</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">99.9%</div>
                <div className="opacity-80">Uptime</div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full blur-xl"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </motion.div>

      {/* Right Side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          {/* Connection Help Modal */}
          {showConnectionHelp && !isOfflineMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-orange-200 dark:border-orange-800"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Connection Problem
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Unable to connect to the database. This could be due to:
                </p>
                
                <div className="text-left bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      Network connectivity issues
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      Supabase project configuration problems
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      Invalid database URL or API key
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-500 mr-2">•</span>
                      Temporary server maintenance
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleSwitchToOffline}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <WifiOff className="w-5 h-5" />
                    Continue in Demo Mode
                  </button>
                  
                  <button
                    onClick={handleRetryConnection}
                    className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Retry Connection
                  </button>
                  
                  <button
                    onClick={() => setShowConnectionHelp(false)}
                    className="w-full py-2 text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    Continue Anyway
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700"
          >
            {/* Security Badge */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-800">
                <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  {isOfflineMode ? 'Demo Mode Active' : 'Bank-Level Security'}
                </span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {mode === 'signin' && (
                <motion.div
                  key="signin"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <SignInForm onSwitchMode={setMode} />
                </motion.div>
              )}
              
              {mode === 'signup' && (
                <motion.div
                  key="signup"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <SignUpForm onSwitchMode={setMode} />
                </motion.div>
              )}
              
              {mode === 'forgot' && (
                <motion.div
                  key="forgot"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <ForgotPasswordForm onSwitchMode={setMode} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isOfflineMode 
                ? 'Running in demo mode - All features available locally'
                : 'Protected by enterprise-grade encryption'
              }
            </p>
            
            {/* Debug Info for Development */}
            {import.meta.env.DEV && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                <p className="font-semibold mb-1">🔧 Debug Info:</p>
                <p>Connection: {connectionStatus}</p>
                <p>Mode: {isOfflineMode ? 'Offline' : 'Online'}</p>
                <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing'}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;