## Withdrawal Endpoints

### 1. Initiate Withdrawal
Initiate withdrawal with automatic 2FA handling.

**Endpoint:** `POST /api/wallet/withdraw`  
**Authentication:** Required  
**Rate Limit:** 5 requests per minute  
**Headers:** 
- `Idempotency-Key: <unique-key>` (Required)

**Request Body (NGN - Paystack):**
```json
{
  "amount": 10000.00,
  "currency": "NGN",
  "gateway": "paystack",
  "bankCode": "044",
  "accountNumber": "0123456789",
  "accountName": "John Doe"
}
```

**Request Body (USD - Stripe):**
```json
{
  "amount": 50.00,
  "currency": "USD",
  "gateway": "stripe",
  "bankName": "Chase Bank",
  "accountNumber": "1234567890",
  "accountName": "John Doe"
}
```

**Response (2FA Required):**
```json
{
  "success": true,
  "message": "Withdrawal requires email confirmation",
  "requires2FA": true,
  "withdrawalId": "withdrawal-uuid",
  "otpSentTo": "j***@example.com",
  "expiresIn": 600,
  "fees": {
    "amount": 10000.00,
    "fee": 100.00,
    "netAmount": 9900.00,
    "currency": "NGN"
  }
}
```

**Response (Direct Processing - Below 2FA Threshold):**
```json
{
  "success": true,
  "message": "Withdrawal initiated successfully",
  "payout": {
    "id": "payout-uuid",
    "amount": "5000.00",
    "currency": "NGN",
    "status": "processing",
    "bankDetails": {
      "bankCode": "044",
      "accountNumber": "0123456789",
      "accountName": "John Doe"
    },
    "fees": {
      "amount": 5000.00,
      "fee": 50.00,
      "netAmount": 4950.00
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Verify Withdrawal OTP
Complete withdrawal after OTP verification.

**Endpoint:** `POST /api/wallet/verify-withdrawal`  
**Authentication:** Required

**Request Body:**
```json
{
  "withdrawalId": "withdrawal-uuid",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Withdrawal confirmed and processing",
  "withdrawalData": {
    "id": "payout-uuid",
    "amount": "10000.00",
    "currency": "NGN",
    "status": "processing",
    "estimatedCompletion": "2024-01-16T10:30:00Z"
  },
  "nextStep": "processing_withdrawal"
}
```

### 3. Resend Withdrawal OTP
Resend OTP for pending withdrawal.

**Endpoint:** `POST /api/wallet/resend-withdrawal-otp`  
**Authentication:** Required

**Request Body:**
```json
{
  "withdrawalId": "withdrawal-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Confirmation code resent successfully",
  "otpSentTo": "j***@example.com",
  "expiresIn": 600,
  "canResendAfter": 60
}
```

### 4. Cancel Withdrawal
Cancel pending withdrawal before OTP verification.

**Endpoint:** `POST /api/wallet/cancel-withdrawal`  
**Authentication:** Required

**Request Body:**
```json
{
  "withdrawalId": "withdrawal-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Withdrawal cancelled successfully",
  "refundedAmount": "10000.00",
  "currency": "NGN"
}
```

### 5. Get Withdrawal History
Get user's withdrawal history.

**Endpoint:** `GET /api/wallet/withdrawals?status=completed&limit=50&offset=0`  
**Authentication:** Required

**Query Parameters:**
- `status`: Optional - Filter by "pending", "processing", "completed", "failed"
- `limit`: Optional - Number of results (default: 50)
- `offset`: Optional - Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "total": 25,
  "withdrawals": [
    {
      "id": "payout-uuid",
      "amount": "10000.00",
      "currency": "NGN",
      "status": "completed",
      "gateway": "paystack",
      "bankDetails": {
        "bankCode": "044",
        "accountNumber": "0123456789",
        "accountName": "John Doe"
      },
      "fees": {
        "amount": 10000.00,
        "fee": 100.00,
        "netAmount": 9900.00
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "completedAt": "2024-01-15T11:00:00Z"
    }
  ],
  "limit": 50,
  "offset": 0
}
```

### 6. Calculate Withdrawal Fees
Preview withdrawal fees before initiating.

**Endpoint:** `POST /api/wallet/calculate-fees`  
**Authentication:** Required

**Request Body:**
```json
{
  "amount": 10000.00,
  "gateway": "paystack"
}
```

**Response:**
```json
{
  "success": true,
  "fees": {
    "amount": 10000.00,
    "fee": 100.00,
    "netAmount": 9900.00,
    "feePercentage": 1.0,
    "currency": "NGN"
  }
}
```

### 7. Calculate Currency-Specific Withdrawal Fees
Get detailed fee calculation for specific currency.

**Endpoint:** `POST /api/wallet/calculate-withdrawal-fees`  
**Authentication:** Not required

**Request Body:**
```json
{
  "amount": 10000.00,
  "currency": "NGN"
}
```

**Response:**
```json
{
  "success": true,
  "fees": {
    "currency": "NGN",
    "amount": 10000.00,
    "gateway": "paystack",
    "feeStructure": {
      "percentage": 1.5,
      "fixed": 100.00,
      "minimum": 50.00,
      "cap": 2000.00
    },
    "calculatedFee": 250.00,
    "netAmount": 9750.00,
    "breakdown": {
      "percentageFee": 150.00,
      "fixedFee": 100.00,
      "totalFee": 250.00
    }
  }
}
```

### 8. Get Supported Banks
Get list of supported banks for currency.

**Endpoint:** `GET /api/wallet/supported-banks/NGN`  
**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "currency": "NGN",
  "banks": [
    {
      "name": "Access Bank",
      "code": "044",
      "slug": "access-bank",
      "type": "commercial"
    },
    {
      "name": "Guaranty Trust Bank",
      "code": "058",
      "slug": "guaranty-trust-bank",
      "type": "commercial"
    }
  ]
}
```

### 9. Resolve Account Number
Verify bank account details.

**Endpoint:** `POST /api/wallet/resolve-account`  
**Authentication:** Required

**Request Body:**
```json
{
  "accountNumber": "0123456789",
  "bankCode": "044",
  "fallbackMode": false
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "accountNumber": "0123456789",
    "accountName": "JOHN DOE",
    "bankCode": "044",
    "bankName": "Access Bank"
  }
}
```

**Response (Fallback Mode):**
```json
{
  "success": true,
  "data": {
    "accountNumber": "0123456789",
    "accountName": null,
    "bankCode": "044",
    "bankName": "Access Bank",
    "fallbackMode": true,
    "message": "Account verification temporarily unavailable. Please verify account details manually."
  }
}
```

### 10. Get Withdrawal Limits
Get withdrawal limits for specific currency.

**Endpoint:** `GET /api/wallet/withdrawal-limits/NGN`  
**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "currency": "NGN",
  "limits": {
    "minimum": 1000.00,
    "maximum": 500000.00,
    "daily": 100000.00,
    "monthly": 2000000.00
  },
  "fees": {
    "percentage": 1.5,
    "fixed": 100.00,
    "minimum": 50.00,
    "cap": 2000.00
  }
}
```

### 11. Get 2FA Configuration
Get 2FA settings and thresholds.

**Endpoint:** `GET /api/wallet/2fa-config`  
**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "config": {
    "thresholds": {
      "NGN": 10000.00,
      "USD": 25.00
    },
    "userTier": "default",
    "otpSettings": {
      "expiryMinutes": 10,
      "maxAttempts": 3,
      "resendCooldownSeconds": 60
    }
  }
}
```