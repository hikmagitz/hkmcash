export const STRIPE_PRODUCTS = {
  premium_access: {
    priceId: 'price_1OqGXDEwKDyxQzaiVYq9nLx2', // Using a placeholder price ID - you'll need to replace this with your actual Stripe Price ID
    name: 'HKM Cash Premium',
    description: 'Premium access to a premium tracker app for cash. Excel export, json export, pdf download, unlimited transaction',
    price: '4.99',
    currency: 'EUR',
    mode: 'subscription' as const,
  },
} as const;