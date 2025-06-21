export const STRIPE_PRODUCTS = {
  premium_access: {
    priceId: 'price_1RcUnyEwKDyxQzaiOAkb8AOp', // You'll need to update this with your actual Stripe price ID for €12/month
    name: 'HKM Premium',
    description: 'Get unlimited transactions, PDF receipts, Excel exports, and advanced features',
    price: '12.00',
    currency: 'EUR',
    mode: 'subscription' as const,
  },
} as const;