import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Settings, 
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import Button from '../UI/Button';

interface ConnectionTroubleshooterProps {
  onClose: () => void;
  onSwitchToOffline: () => void;
}

const ConnectionTroubleshooter: React.FC<ConnectionTroubleshooterProps> = ({ 
  onClose, 
  onSwitchToOffline 
}) => {
  const [showEnvVars, setShowEnvVars] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const diagnostics = [
    {
      name: 'Environment Variables',
      status: supabaseUrl && supabaseKey ? 'success' : 'error',
      message: supabaseUrl && supabaseKey 
        ? 'Supabase credentials are configured' 
        : 'Missing Supabase environment variables'
    },
    {
      name: 'Network Connection',
      status: navigator.onLine ? 'success' : 'error',
      message: navigator.onLine 
        ? 'Internet connection is available' 
        : 'No internet connection detected'
    },
    {
      name: 'Supabase URL Format',
      status: supabaseUrl && supabaseUrl.includes('.supabase.co') ? 'success' : 'warning',
      message: supabaseUrl && supabaseUrl.includes('.supabase.co')
        ? 'URL format appears correct'
        : 'URL format may be incorrect'
    }
  ];

  const copyToClipboard = (text: string, varName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVar(varName);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Connection Troubleshooter
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Diagnose and fix connection issues
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Diagnostics */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            System Diagnostics
          </h3>
          
          {diagnostics.map((diagnostic, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(diagnostic.status)}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {diagnostic.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {diagnostic.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Environment Variables */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Environment Configuration
            </h3>
            <button
              onClick={() => setShowEnvVars(!showEnvVars)}
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showEnvVars ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showEnvVars ? 'Hide' : 'Show'} Variables
            </button>
          </div>

          {showEnvVars && (
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    VITE_SUPABASE_URL
                  </label>
                  {supabaseUrl && (
                    <button
                      onClick={() => copyToClipboard(supabaseUrl, 'url')}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedVar === 'url' ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>
                <code className="text-xs bg-white dark:bg-gray-800 p-2 rounded border block overflow-x-auto">
                  {supabaseUrl || 'Not set'}
                </code>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    VITE_SUPABASE_ANON_KEY
                  </label>
                  {supabaseKey && (
                    <button
                      onClick={() => copyToClipboard(supabaseKey, 'key')}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedVar === 'key' ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>
                <code className="text-xs bg-white dark:bg-gray-800 p-2 rounded border block overflow-x-auto">
                  {supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'Not set'}
                </code>
              </div>
            </div>
          )}
        </div>

        {/* Solutions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Possible Solutions
          </h3>
          
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                1. Check Environment Variables
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                Ensure your .env file contains valid Supabase credentials:
              </p>
              <code className="text-xs bg-blue-100 dark:bg-blue-900/40 p-2 rounded block">
                VITE_SUPABASE_URL=https://your-project.supabase.co<br/>
                VITE_SUPABASE_ANON_KEY=your-anon-key
              </code>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">
                2. Verify Supabase Project
              </h4>
              <p className="text-sm text-green-800 dark:text-green-300 mb-2">
                Check your Supabase project settings and ensure it's active.
              </p>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-green-700 dark:text-green-300 hover:underline"
              >
                Open Supabase Dashboard
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">
                3. Check Network Connection
              </h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Ensure you have a stable internet connection and no firewall is blocking the request.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="primary"
            onClick={onSwitchToOffline}
            className="flex-1"
          >
            Continue in Demo Mode
          </Button>
          <Button
            type="secondary"
            onClick={() => window.location.reload()}
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Connection
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ConnectionTroubleshooter;