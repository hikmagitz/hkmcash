import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { Crown } from 'lucide-react';

const PremiumPage: React.FC = () => {
  const { checkoutSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = await checkoutSession(import.meta.env.VITE_STRIPE_PRICE_ID);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout process');
      console.error('Error creating checkout session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Upgrade to Premium
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Get access to advanced features and unlimited transactions
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center">
            <span className="text-teal-600 mr-2">✓</span>
            <span className="text-gray-700 dark:text-gray-300">Unlimited transactions</span>
          </div>
          <div className="flex items-center">
            <span className="text-teal-600 mr-2">✓</span>
            <span className="text-gray-700 dark:text-gray-300">Advanced analytics</span>
          </div>
          <div className="flex items-center">
            <span className="text-teal-600 mr-2">✓</span>
            <span className="text-gray-700 dark:text-gray-300">Export to Excel</span>
          </div>
          <div className="flex items-center">
            <span className="text-teal-600 mr-2">✓</span>
            <span className="text-gray-700 dark:text-gray-300">Priority support</span>
          </div>
        </div>

        <div className="mb-8">
          <div className="text-4xl font-bold text-gray-800 dark:text-white">
            $9.99
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
          <Crown className="w-5 h-5 mr-2" />
          {isLoading ? 'Processing...' : 'Upgrade Now'}
        </Button>
      </Card>
    </div>
  );
};

export default PremiumPage;