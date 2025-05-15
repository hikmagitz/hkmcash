import { useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { STRIPE_PRODUCTS } from '../stripe-config';

export const useStripe = () => {
  const supabase = useSupabaseClient();

  const redirectToCheckout = useCallback(async (productId: keyof typeof STRIPE_PRODUCTS) => {
    const product = STRIPE_PRODUCTS[productId];
    if (!product) {
      throw new Error('Invalid product ID');
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: product.priceId,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/premium`,
          mode: product.mode || 'subscription'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { session_url } = await response.json();

      if (!session_url) {
        throw new Error('No checkout URL returned');
      }

      window.location.href = session_url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }, []);

  return { redirectToCheckout };
};