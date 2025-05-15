import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

const SuccessPage: React.FC = () => {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Payment Successful!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Thank you for upgrading to Premium. Your account has been upgraded successfully.
          </p>
        </div>

        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Redirecting to dashboard in {countdown} seconds...
        </p>

        <Button 
          type="primary" 
          className="w-full"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard Now
        </Button>
      </Card>
    </div>
  );
};