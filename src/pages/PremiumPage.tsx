import React, { useState } from 'react';
import { Crown, Check, ArrowLeft, Zap, FileText, Download, BarChart3, Shield, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useStripe } from '../hooks/useStripe';
import { useAuth } from '../context/AuthContext';
import { STRIPE_PRODUCTS } from '../stripe-config';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

const PremiumPage: React.FC = () => {
  const navigate = useNavigate();
  const intl = useIntl();
  const { redirectToCheckout } = useStripe();
  const { isPremium, isOfflineMode } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (isOfflineMode) {
      alert('Premium upgrade is not available in offline mode. Please connect to the internet to upgrade.');
      return;
    }

    setIsLoading(true);
    try {
      await redirectToCheckout('premium_access');
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      alert('Failed to redirect to checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Unlimited Transactions',
      description: 'Add as many transactions as you need without any limits',
      highlight: true
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'PDF Receipts',
      description: 'Generate professional PDF receipts for all your transactions',
      highlight: true
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: 'Advanced Exports',
      description: 'Export your data to Excel, JSON, and other formats',
      highlight: true
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Advanced Analytics',
      description: 'Get detailed insights and reports on your finances',
      highlight: false
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Priority Support',
      description: '24/7 premium customer support via email and chat',
      highlight: false
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Early Access',
      description: 'Be the first to try new features and updates',
      highlight: false
    }
  ];

  if (isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900 dark:via-emerald-900 dark:to-teal-900 px-4">
        <Card className="w-full max-w-md text-center border-2 border-green-200 dark:border-green-800">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              You're Premium!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Enjoy all the premium features and unlimited access
            </p>
          </div>

          <div className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center text-left">
                <div className="text-green-600 dark:text-green-400 mr-3">
                  {feature.icon}
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {feature.title}
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button 
            type="secondary" 
            className="w-full mb-4" 
            onClick={() => navigate('/dashboard')}
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Button>

          <Button 
            type="secondary" 
            className="w-full" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 px-4">
      <Card className="w-full max-w-lg text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-pulse">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Upgrade to Premium
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Unlock powerful features and take control of your finances
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`flex items-start text-left p-4 rounded-xl transition-all duration-200 ${
                feature.highlight 
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800' 
                  : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className={`p-2 rounded-lg mr-4 flex-shrink-0 ${
                feature.highlight 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {feature.icon}
              </div>
              <div>
                <h3 className={`font-semibold mb-1 ${
                  feature.highlight 
                    ? 'text-blue-900 dark:text-blue-200' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {feature.title}
                  {feature.highlight && (
                    <span className="ml-2 px-2 py-1 text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full">
                      Popular
                    </span>
                  )}
                </h3>
                <p className={`text-sm ${
                  feature.highlight 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                €12
              </span>
              <div className="text-left">
                <span className="text-lg text-gray-600 dark:text-gray-400">/month</span>
                <div className="text-xs text-gray-500 dark:text-gray-500">billed monthly</div>
              </div>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
              Cancel anytime • No setup fees • 30-day money-back guarantee
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button 
            type="primary" 
            className="w-full py-4 text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-xl hover:shadow-2xl transform hover:scale-105" 
            onClick={handleUpgrade}
            disabled={isLoading || isOfflineMode}
            loading={isLoading}
          >
            <Crown className="w-6 h-6 mr-2" />
            {isLoading ? 'Processing...' : 'Upgrade to Premium'}
          </Button>

          {isOfflineMode && (
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Premium upgrade is not available in offline mode. Please connect to the internet to upgrade.
              </p>
            </div>
          )}
          
          <Button 
            type="secondary" 
            className="w-full" 
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>No Hidden Fees</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              <span>5-Star Support</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PremiumPage;