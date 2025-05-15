import React, { useState } from 'react';
import { Crown, CheckCircle, Loader2 } from 'lucide-react';
import { useIntl } from 'react-intl';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { useStripe } from '../hooks/useStripe';
import { useAuth } from '../context/AuthContext';
import { STRIPE_PRODUCTS } from '../stripe-config';

const PremiumPage: React.FC = () => {
  const { redirectToCheckout } = useStripe();
  const { isPremium } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intl = useIntl();

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await redirectToCheckout('premium_access');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout process');
      console.error('Error creating checkout session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Card className="w-full max-w-md text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              You're a Premium Member!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Thank you for your support. Enjoy all premium features!
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {intl.formatMessage({ id: 'premium.title' })}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {intl.formatMessage({ id: 'premium.description' })}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center">
            <span className="text-teal-600 mr-2">✓</span>
            <span className="text-gray-700 dark:text-gray-300">
              {intl.formatMessage({ id: 'premium.features.unlimited' })}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-teal-600 mr-2">✓</span>
            <span className="text-gray-700 dark:text-gray-300">
              {intl.formatMessage({ id: 'premium.features.pdf' })}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-teal-600 mr-2">✓</span>
            <span className="text-gray-700 dark:text-gray-300">
              {intl.formatMessage({ id: 'premium.features.excel' })}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-teal-600 mr-2">✓</span>
            <span className="text-gray-700 dark:text-gray-300">
              {intl.formatMessage({ id: 'premium.features.support' })}
            </span>
          </div>
        </div>

        <div className="mb-8">
          <div className="text-4xl font-bold text-gray-800 dark:text-white">
            €2.99
            <span className="text-lg text-gray-600 dark:text-gray-400">/month</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <Button 
          type="primary" 
          className="w-full" 
          onClick={handleUpgrade}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Crown className="w-5 h-5 mr-2" />
              {intl.formatMessage({ id: 'premium.upgrade' })}
            </>
          )}
        </Button>
      </Card>
    </div>
  );
};

export default PremiumPage;