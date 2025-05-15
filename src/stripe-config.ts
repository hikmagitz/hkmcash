export const STRIPE_PRODUCTS = {
  premium_access: {
    priceId: 'price_1RP8tuEwKDyxQzaiswwZ4ULj',
    name: 'HKM Premium',
    description: 'Get unlimited transactions, PDF receipts, Excel exports, and JSON exports',
    price: '4.99',
    currency: 'EUR',
    mode: 'subscription' as const,
  },
} as const;