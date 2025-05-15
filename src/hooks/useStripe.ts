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

  const redirectToCheckout = useCallback(async (productId: keyof typeof STRIPE_PRODUCTS) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      throw new Error('Failed to get session');
    }

    const product = STRIPE_PRODUCTS[productId];
    if (!product) {
      throw new Error('Invalid product ID');
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: product.priceId,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/settings`,
          mode: product.mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (!data.session_url) {
        throw new Error('No checkout URL returned');
      }

      window.location.href = data.session_url;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error creating checkout session:', error.message);
        throw new Error(`Failed to create checkout session: ${error.message}`);
      } else {
        console.error('Unknown error creating checkout session:', error);
        throw new Error('Failed to create checkout session');
      }
    }
  }, [user]);

  return {
    redirectToCheckout,
  };
}