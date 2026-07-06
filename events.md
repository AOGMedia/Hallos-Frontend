Campaign Registration API

1. Register for Campaign
POST /api/campaigns/register

Creates a pending registration and returns a Paystack payment URL. Redirect the user to authorizationUrl to complete payment.

Auth required: No

Request Body:


{
  "firstName": "Tolu",
  "lastName": "Adeyemi",
  "email": "tolu@gmail.com",
  "phoneNumber": "08012345678",
  "location": "Lagos",
  "talent": "Content Creator",
  "jobDescription": "I create short-form videos for brands on TikTok and Instagram",
  "whatToLearn": "I want to learn how to negotiate brand deals and manage my finances better"
}
Field	Type	Required	Notes
firstName	string	✅	
lastName	string	✅	
email	string	✅	Valid email format
phoneNumber	string	✅	
location	string	✅	Nigerian state e.g. "Lagos", "Abuja"
talent	string	✅	Value from dropdown
jobDescription	string	❌	Optional
whatToLearn	string	❌	Optional
✅ Success Response 200:


{
  "success": true,
  "message": "Registration initiated. Complete your payment to confirm your spot.",
  "authorizationUrl": "https://checkout.paystack.com/abc123xyz",
  "accessCode": "abc123xyz",
  "reference": "camp_1718200000000_k3j9x2a",
  "registrationId": "f3b2c1a0-1234-4abc-8def-000011112222"
}
Frontend flow: Redirect user to authorizationUrl. Paystack handles payment and redirects back to your callback URL. After redirect, call endpoint #2 with the reference.

❌ Error Responses:

400 — Missing or invalid fields:


{
  "success": false,
  "message": "Missing required fields: firstName, phoneNumber"
}
400 — Invalid email:


{
  "success": false,
  "message": "Invalid email address"
}
409 — Already registered with same email:


{
  "success": false,
  "message": "This email address has already registered and paid for the campaign.",
  "alreadyRegistered": true
}
2. Verify Campaign Payment
POST /api/campaigns/verify/:reference
GET /api/campaigns/verify/:reference

Call this after Paystack redirects the user back to your site. Verifies the payment with Paystack, confirms the registration, and triggers the confirmation email. Safe to call multiple times (idempotent).

Auth required: No

URL Param: reference — the reference string returned from /register

Request Body: None

✅ Success Response 200 — First call (payment just confirmed):


{
  "success": true,
  "message": "Payment confirmed! Check your email for retreat details.",
  "registration": {
    "id": "f3b2c1a0-1234-4abc-8def-000011112222",
    "firstName": "Tolu",
    "lastName": "Adeyemi",
    "email": "tolu@gmail.com",
    "paymentStatus": "completed"
  }
}
✅ Success Response 200 — Already confirmed (idempotent):


{
  "success": true,
  "message": "Payment already confirmed. Welcome to the retreat!",
  "alreadyProcessed": true,
  "registration": {
    "id": "f3b2c1a0-1234-4abc-8def-000011112222",
    "firstName": "Tolu",
    "lastName": "Adeyemi",
    "email": "tolu@gmail.com",
    "paymentStatus": "completed"
  }
}
❌ Error Responses:

400 — Payment not successful:


{
  "success": false,
  "message": "Payment not successful. Paystack status: failed"
}
404 — Reference not found:


{
  "success": false,
  "message": "Registration not found for this reference"
}
3. List All Registrations (Admin only)
GET /api/campaigns/registrations

Auth required: Yes — Bearer token (admin role)

Query Params:

Param	Type	Default	Notes
status	string	all	pending, completed, failed
page	number	1	
limit	number	50	
Example: GET /api/campaigns/registrations?status=completed&page=1&limit=20

Headers:


Authorization: Bearer <admin_jwt_token>
✅ Success Response 200:


{
  "success": true,
  "total": 142,
  "page": 1,
  "limit": 20,
  "registrations": [
    {
      "id": "f3b2c1a0-1234-4abc-8def-000011112222",
      "firstName": "Tolu",
      "lastName": "Adeyemi",
      "email": "tolu@gmail.com",
      "phoneNumber": "08012345678",
      "location": "Lagos",
      "talent": "Content Creator",
      "jobDescription": "I create short-form videos for brands",
      "whatToLearn": "Negotiation and financial literacy",
      "paymentStatus": "completed",
      "amount": "2000.00",
      "currency": "NGN",
      "paymentReference": "camp_1718200000000_k3j9x2a",
      "emailSent": true,
      "createdAt": "2026-06-12T10:30:00.000Z"
    }
  ]
}
Complete Frontend Flow

1.  User fills form
         ↓
2.  POST /api/campaigns/register
         ↓
3.  Redirect user to → authorizationUrl (Paystack checkout)
         ↓
4.  User pays on Paystack
         ↓
5.  Paystack redirects to your callback URL
    (e.g. https://hallos.net/campaign/success?reference=camp_xxx)
         ↓
6.  Frontend reads ?reference from URL
         ↓
7.  POST /api/campaigns/verify/:reference
         ↓
8.  Show success page — email is sent automatically
Suggested Talent Dropdown Values
These are what the frontend should show in the dropdown. Backend accepts any string.


Content Creator
Photographer / Videographer
Graphic Designer
Digital Marketer
Social Media Manager
Copywriter
Video Editor
Brand Strategist
Influencer / Public Figure
Entrepreneur
Student
Other