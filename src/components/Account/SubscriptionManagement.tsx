import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  AlertTriangle, 
  CheckCircle, 
  Loader, 
  Calendar,
  CreditCard,
  X,
  Shield,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createClient } from '@supabase/supabase-js';
import Card from '../UI/Card';
import Button from '../UI/Button';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface SubscriptionData {
  subscription_id: string | null;
  subscription_status: string | null;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean | null;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

const SubscriptionManagement: React.FC = () => {
  const { user, isPremium, isOfflineMode } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!user || isOfflineMode || !isPremium) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .single();

        if (error) {
          console.error('Error fetching subscription:', error);
          setError('Failed to load subscription data');
        } else {
          setSubscriptionData(data);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load subscription data');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [user, isOfflineMode, isPremium]);

  const handleCancelSubscription = async () => {
    if (!subscriptionData?.subscription_id) {
      setError('No active subscription found');
      return;
    }

    setCancelling(true);
    setError('');
    setSuccess('');

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          subscription_id: subscriptionData.subscription_id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel subscription');
      }

      setSuccess('Subscription cancelled successfully. You will retain access until the end of your current billing period.');
      setShowCancelModal(false);
      
      // Refresh subscription data
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err: any) {
      console.error('Error cancelling subscription:', err);
      setError(err.message || 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isOfflineMode) {
    return (
      <Card className="hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Subscription Management
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Not available in offline mode
            </p>
          </div>
        </div>

        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <p className="text-sm text-orange-700 dark:text-orange-300">
            Subscription management is not available in offline mode. Please connect to the internet to manage your subscription.
          </p>
        </div>
      </Card>
    );
  }

  if (!isPremium) {
    return (
      <Card className="hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl shadow-lg">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Subscription Management
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No active subscription
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            You don't have an active premium subscription. Upgrade to access premium features.
          </p>
          <Button type="primary" onClick={() => window.location.href = '/premium'}>
            <Crown size={16} />
            Upgrade to Premium
          </Button>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Subscription Management
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading subscription details...
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center py-8">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl shadow-lg">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Subscription Management
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your premium subscription
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Success</p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">{success}</p>
              </div>
            </div>
          </div>
        )}

        {subscriptionData ? (
          <div className="space-y-4">
            {/* Subscription Status */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-l-4 border-green-500">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                  Subscription Status
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-gray-800 dark:text-white capitalize">
                  {subscriptionData.subscription_status?.replace('_', ' ') || 'Active'}
                </p>
                {subscriptionData.cancel_at_period_end && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200 text-xs font-medium rounded-full">
                    Cancelling at period end
                  </span>
                )}
              </div>
            </div>

            {/* Billing Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                    Current Period
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {formatDate(subscriptionData.current_period_start)} - {formatDate(subscriptionData.current_period_end)}
                </p>
              </div>

              {subscriptionData.payment_method_brand && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border-l-4 border-purple-500">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                      Payment Method
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white capitalize">
                    {subscriptionData.payment_method_brand} •••• {subscriptionData.payment_method_last4}
                  </p>
                </div>
              )}
            </div>

            {/* Next Billing Date */}
            {!subscriptionData.cancel_at_period_end && (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Next billing date
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatDate(subscriptionData.current_period_end)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">€12.00</p>
                  </div>
                </div>
              </div>
            )}

            {/* Cancellation Warning for Already Cancelled */}
            {subscriptionData.cancel_at_period_end && (
              <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                      Subscription Cancelled
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                      Your subscription has been cancelled and will end on {formatDate(subscriptionData.current_period_end)}. 
                      You will retain access to premium features until then.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cancel Subscription Button */}
            {!subscriptionData.cancel_at_period_end && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="danger"
                  onClick={() => setShowCancelModal(true)}
                  className="w-full"
                  disabled={cancelling}
                >
                  <X size={16} />
                  Cancel Subscription
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Unable to load subscription details. Please try refreshing the page.
            </p>
            <Button 
              type="secondary" 
              onClick={() => window.location.reload()} 
              className="mt-3"
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
          </div>
        )}
      </Card>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Cancel Subscription?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to cancel your premium subscription?
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  What happens when you cancel:
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• You'll lose access to premium features at the end of your billing period</li>
                  <li>• No more charges will be made to your payment method</li>
                  <li>• You can resubscribe at any time</li>
                  <li>• Your data will be preserved</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-800 dark:text-blue-200">
                    Access until: {formatDate(subscriptionData?.current_period_end)}
                  </span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You'll continue to have premium access until your current billing period ends.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="secondary"
                onClick={() => setShowCancelModal(false)}
                className="flex-1"
                disabled={cancelling}
              >
                Keep Subscription
              </Button>
              <Button
                type="danger"
                onClick={handleCancelSubscription}
                className="flex-1"
                loading={cancelling}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default SubscriptionManagement;