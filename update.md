Live Class & Live Series Registration — API Documentation


All endpoints require Authorization: Bearer <token> header.

Live Class Registration
1. Secure a Spot (Free Live Classes Only)
POST /live/:id/register

No request body needed. The logged-in user's details are used automatically.

Response (201):

{
  "success": true,
  "message": "Spot secured! You will receive a reminder before the class starts.",
  "data": {
    "id": "uuid",
    "liveClassId": "uuid",
    "userId": 9,
    "statusPaid": false,
    "createdAt": "2026-05-10T10:00:00.000Z"
  }
}
Error Responses:

{ "success": false, "message": "This is a paid live class. Please complete payment to register." } // 400
{ "success": false, "message": "You have already secured a spot for this class." }                 // 409
{ "success": false, "message": "Sorry, this class is full." }                                      // 400
{ "success": false, "message": "This live class is no longer accepting registrations" }            // 400
For paid live classes, registration is confirmed automatically after payment completes. No need to call this endpoint.

2. Cancel Spot (Free Live Classes)
DELETE /live/:id/register

No request body needed.

Response (200):

{
  "success": true,
  "message": "Registration cancelled."
}
3. Get Registrations — Creator/Admin Only
GET /live/:id/registrations?page=1&limit=20

Query Params:

Param	Default	Description
page	1	Page number
limit	20	Items per page
Response (200):

{
  "success": true,
  "data": {
    "total": 45,
    "totalFree": 30,
    "totalPaid": 15,
    "page": 1,
    "limit": 20,
    "registrations": [
      {
        "userId": 9,
        "firstname": "Abdul",
        "lastname": "Lateef",
        "email": "user@example.com",
        "registrationType": "paid",
        "amount": 5000,
        "currency": "NGN",
        "registeredAt": "2026-05-01T10:00:00.000Z"
      },
      {
        "userId": 12,
        "firstname": "Jane",
        "lastname": "Doe",
        "email": "jane@example.com",
        "registrationType": "free",
        "registeredAt": "2026-05-02T10:00:00.000Z"
      }
    ]
  }
}
Paid registrations appear first, then free. registrationType is either "paid" or "free". Paid entries include amount and currency, free entries do not.

Live Series Registration
4. Secure a Spot (Free Live Series Only)
POST /api/live/series/:id/register

No request body needed.

Response (201):

{
  "success": true,
  "message": "Spot secured! You will receive reminders before each session starts.",
  "data": {
    "id": "uuid",
    "seriesId": "uuid",
    "userId": 9,
    "createdAt": "2026-05-10T10:00:00.000Z"
  }
}
Error Responses:

{ "success": false, "message": "This is a paid live series. Please complete payment to register." } // 400
{ "success": false, "message": "You have already secured a spot for this series." }                 // 409
{ "success": false, "message": "Sorry, this series is full." }                                      // 400
{ "success": false, "message": "This series is no longer accepting registrations" }                 // 400
For paid live series, registration is confirmed automatically after payment. No need to call this endpoint.

5. Cancel Spot (Free Live Series)
DELETE /api/live/series/:id/register

No request body needed.

Response (200):

{
  "success": true,
  "message": "Registration cancelled."
}
6. Get Registrations — Creator/Admin Only
GET /api/live/series/:id/registrations?page=1&limit=20

Query Params:

Param	Default	Description
page	1	Page number
limit	20	Items per page
Response (200):

{
  "success": true,
  "data": {
    "total": 80,
    "totalFree": 50,
    "totalPaid": 30,
    "page": 1,
    "limit": 20,
    "registrations": [
      {
        "userId": 9,
        "firstname": "Abdul",
        "lastname": "Lateef",
        "email": "user@example.com",
        "registrationType": "paid",
        "amount": 10000,
        "currency": "NGN",
        "registeredAt": "2026-05-01T10:00:00.000Z"
      },
      {
        "userId": 15,
        "firstname": "John",
        "lastname": "Smith",
        "email": "john@example.com",
        "registrationType": "free",
        "registeredAt": "2026-05-03T10:00:00.000Z"
      }
    ]
  }
}
General Notes for Frontend
How to determine if registration button should show:

Check price on the live class/series
If price === 0 → show "Secure My Spot" button → call POST /register
If price > 0 → show "Register & Pay" button → go through payment flow (existing)
How to check if current user is already registered:

For free: call GET /live/:id or GET /api/live/series/:id — you can add a check on the frontend by calling the register endpoint and handling the 409 response, or the backend can expose a isRegistered field (let me know if you want that added)
Reminders:

Sent automatically 1 hour before the class/session starts
No frontend action needed — the backend cron handles it
Error shape (all endpoints):

{
  "success": false,
  "message": "Description of what went wrong"
}