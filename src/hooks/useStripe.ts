import { useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../context/AuthContext';
import { STRIPE_PRODUCTS } from '../stripe-config';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function useStripe() {
  const { user } = useAuth();

  const createCheckoutSession = useCallback(async (priceId: string, mode: 'payment' | 'subscription') => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      throw new Error('Failed to get session');
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        price_id: priceId,
        success_url: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/premium`,
        mode,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    const { url } = await response.json();
    return url;
  }, [user]);

  const redirectToCheckout = useCallback(async (productId: keyof typeof STRIPE_PRODUCTS) => {
    try {
      const product = STRIPE_PRODUCTS[productId];
      if (!product) {
        throw new Error('Invalid product ID');
      }

      const url = await createCheckoutSession(product.priceId, product.mode);
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      throw error;
    }
  }, [createCheckoutSession]);

  return {
    redirectToCheckout,
  };
}