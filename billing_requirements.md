# Billing System Requirements for Mozambican/African Market

## Payment Methods
- **M-Pesa** (Mobile Money)
- **e-Mola** (Mobile Money)
- **Cartão de Débito** (Debit Card)
- **Cartão de Crédito** (Credit Card)

## Credit System
- **Minimum Purchase**: 2 USD (≈ 130 MZN) = 20 credits
- **Credit Usage**: 2 credits per message sent
- **Credit Packages**:
  - 20 credits = 2 USD (130 MZN)
  - 50 credits = 5 USD (325 MZN)
  - 100 credits = 10 USD (650 MZN)
  - 200 credits = 20 USD (1,300 MZN)
  - 500 credits = 50 USD (3,250 MZN)

## Referral System
- **New User Bonus**: 200 free credits upon registration
- **Referral Bonus**: 50 credits for each successful referral
- **Commission**: 5% of credits purchased by referred users

## Database Schema (Redis)
```
user:{user_id} = {
  id: string,
  email: string,
  credits: number,
  total_spent: number,
  referrer_id: string|null,
  referral_code: string,
  created_at: timestamp
}

transaction:{transaction_id} = {
  id: string,
  user_id: string,
  type: 'purchase'|'referral_bonus'|'commission'|'usage',
  amount: number,
  credits: number,
  payment_method: string,
  status: 'pending'|'completed'|'failed',
  created_at: timestamp
}

referral:{referral_code} = {
  user_id: string,
  referred_users: array,
  total_commissions: number
}
```

## API Endpoints
- POST /api/billing/purchase - Purchase credits
- GET /api/billing/balance - Get user credit balance
- POST /api/billing/use-credits - Deduct credits for message
- GET /api/billing/transactions - Get transaction history
- POST /api/referral/apply - Apply referral code
- GET /api/referral/stats - Get referral statistics

## Frontend Components
- Billing Dashboard
- Credit Purchase Modal
- Payment Method Selection
- Transaction History
- Referral Management
- Credit Usage Analytics

