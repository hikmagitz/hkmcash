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

    const { data: { session_url }, error } = await supabase.functions.invoke('stripe-checkout', {
      body: {
        price_id: product.priceId,
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/premium`,
        mode: product.mode || 'subscription'
      }
    });

    if (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }

    if (!session_url) {
      throw new Error('No checkout URL returned');
    }

    window.location.href = session_url;
  }, [supabase]);

  return { redirectToCheckout };
};