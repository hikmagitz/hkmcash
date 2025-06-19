import React from 'react';
import { Crown, Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

const PremiumPage: React.FC = () => {
  const navigate = useNavigate();
  const intl = useIntl();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Premium Features
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            All features are available in the free version!
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            <span className="text-gray-700 dark:text-gray-300">
              Unlimited transactions
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            <span className="text-gray-700 dark:text-gray-300">
              PDF receipts for transactions
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            <span className="text-gray-700 dark:text-gray-300">
              Export to JSON
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            <span className="text-gray-700 dark:text-gray-300">
              All features included
            </span>
          </div>
        </div>

        <div className="mb-8">
          <div className="text-4xl font-bold text-gray-800 dark:text-white">
            FREE
            <span className="text-lg text-gray-600 dark:text-gray-400">/forever</span>
          </div>
        </div>

        <Button 
          type="primary" 
          className="w-full mb-4" 
          onClick={() => navigate('/dashboard')}
        >
          <Check className="w-5 h-5 mr-2" />
          Continue Using Free Version
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
};

export default PremiumPage;