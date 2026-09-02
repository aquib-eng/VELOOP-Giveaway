# VELOOP Giveaway API Documentation

## 1. Introduction

This document describes the REST APIs used by the VELOOP Giveaway application.

The backend is built using:

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication

---

# 2. Base URL

## Local Development

```text
http://localhost:5000/api
```

## Production

Replace the local URL with the deployed backend API URL.

Example:

```text
https://your-backend-domain/api
```

---

# 3. Authentication

Protected APIs require a valid JWT token.

The token is sent using:

```text
Authorization: Bearer <JWT_TOKEN>
```

Example:

```text
Authorization: Bearer eyJhbGciOiJIUzI1Ni...
```

Some giveaway participation APIs also use:

```text
Content-Type: application/json
Idempotency-Key: <UNIQUE_KEY>
X-Idempotency-Key: <UNIQUE_KEY>
X-Veloop-Device-Id: <DEVICE_ID>
X-Request-Id: <REQUEST_ID>
```

---

# 4. Standard Response Format

## Successful Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

## Error Response

```json
{
  "success": false,
  "message": "Error message"
}
```

Some APIs may also return:

```json
{
  "success": false,
  "message": "Duplicate participation request",
  "requestId": "request-id"
}
```

---

# 5. HTTP Status Codes

| Status Code | Meaning |
|---|---|
| 200 | Request successful |
| 201 | Resource created |
| 400 | Bad request / validation error |
| 401 | Authentication required / invalid authentication |
| 403 | Forbidden / insufficient permission |
| 404 | Resource not found |
| 409 | Conflict / duplicate |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

# 6. Authentication APIs

# 6.1 Register User

## Endpoint

```http
POST /api/auth/register
```

## Authentication

Public.

No JWT is required.

## Description

Creates a new VELOOP user account.

## Request Body

```json
{
  "name": "Aquib Malik",
  "email": "aquib@example.com",
  "password": "Password123"
}
```

## Validation

The backend validates:

- Name
- Email
- Email format
- Password
- Duplicate email
- Password length

## Success Response

```json
{
  "success": true,
  "message": "Registration successful"
}
```

## Possible Error

```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

# 6.2 Login User

## Endpoint

```http
POST /api/auth/login
```

## Authentication

Public.

## Description

Authenticates a registered user and generates a JWT.

## Request Body

```json
{
  "email": "aquib@example.com",
  "password": "Password123"
}
```

## Processing

1. Find user by email.
2. Validate password.
3. Check account status.
4. Generate JWT.
5. Return authentication information.

## Success Response

```json
{
  "success": true,
  "token": "<JWT_TOKEN>"
}
```

## Invalid Credentials

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

# 7. Giveaway APIs

# 7.1 Get Current Giveaway

## Endpoint

```http
GET /api/giveaways/current
```

## Authentication

Public.

## Description

Returns the currently active and published giveaway.

## Example Response

```json
{
  "success": true,
  "data": {
    "_id": "6a96d28d5b208410e9cf46f7",
    "title": "Win an iPhone 17",
    "description": "Enter the VELOOP giveaway for a chance to win an amazing prize.",
    "prize": {
      "name": "iPhone 17",
      "value": 79999,
      "image": "",
      "type": "physical"
    },
    "entryFee": 250,
    "status": "active",
    "maxEntriesPerUser": 1,
    "isPublished": true,
    "startDate": "2026-09-01T13:49:08.180Z",
    "endDate": "2026-09-30T13:49:39.093Z"
  }
}
```

> The exact response depends on the giveaway stored in MongoDB.

---

# 7.2 Get All Giveaways

## Endpoint

```http
GET /api/giveaways
```

## Authentication

Public.

## Description

Returns giveaway records available through the giveaway listing API.

## Success Response

```json
{
  "success": true,
  "data": []
}
```

---

# 7.3 Get Previous Giveaways

## Endpoint

```http
GET /api/giveaways/previous
```

## Authentication

Public.

## Description

Returns previous or completed giveaway records.

## Success Response

```json
{
  "success": true,
  "data": []
}
```

---

# 7.4 Get Giveaway by ID

## Endpoint

```http
GET /api/giveaways/:id
```

## Authentication

Public.

## Example

```http
GET /api/giveaways/6a96d28d5b208410e9cf46f7
```

## Description

Returns detailed information for one giveaway.

## Invalid ID

```json
{
  "success": false,
  "message": "Invalid giveaway ID"
}
```

## Giveaway Not Found

```json
{
  "success": false,
  "message": "Giveaway not found"
}
```

---

# 8. Giveaway Participation APIs

# 8.1 Check Entry Status

## Endpoint

```http
GET /api/giveaways/:id/entry-status
```

## Authentication

Required.

## Headers

```text
Authorization: Bearer <JWT_TOKEN>
```

## Description

Checks whether the authenticated user has already participated in the giveaway.

## Example

```http
GET /api/giveaways/6a96d28d5b208410e9cf46f7/entry-status
```

## Unauthorized Response

```json
{
  "success": false,
  "message": "Authentication required"
}
```

---

# 9. Secure Giveaway Entry API

# 9.1 Enter Giveaway

## Endpoint

```http
POST /api/giveaways/:id/enter
```

## Authentication

Required.

## Authorization

Authenticated users.

## Rate Limiting

The giveaway join API is rate-limited to reduce repeated or abusive requests.

## Headers

```text
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
Idempotency-Key: <UNIQUE_REQUEST_KEY>
X-Veloop-Device-Id: <DEVICE_ID>
X-Request-Id: <REQUEST_ID>
```

## Request Body

The backend does not trust frontend-supplied wallet balance or entry fee.

If no request body is required by the controller, send:

```json
{}
```

---

# 9.2 Backend Validation

The backend validates:

1. Giveaway ID.
2. Giveaway existence.
3. Giveaway status.
4. Giveaway start date.
5. Giveaway end date.
6. User authentication.
7. User account status.
8. User eligibility.
9. Existing participation.
10. Entry fee.
11. Wallet balance.
12. Idempotency.
13. Fraud risk.
14. Participation permission.

---

# 9.3 Secure Entry Flow

```text
Valid Giveaway ID
        |
        v
Giveaway Exists
        |
        v
Giveaway Active
        |
        v
Giveaway Started
        |
        v
Giveaway Not Ended
        |
        v
User Authenticated
        |
        v
User Account Active
        |
        v
User Eligible
        |
        v
No Existing Participation
        |
        v
Valid Entry Fee
        |
        v
Valid Wallet Balance
        |
        v
Idempotency Check
        |
        v
Fraud Check
        |
        v
Participation Allowed
```

---

# 9.4 Wallet Processing

The backend uses the authoritative wallet value.

The current User model uses:

```text
walletBalance
```

The backend checks the wallet before deduction.

The frontend must not be trusted for wallet balance.

---

# 9.5 Entry Fee

The backend determines the authoritative entry fee from the giveaway.

The frontend may display the fee but must not be treated as the source of truth.

The current application uses an entry-fee fallback when an older giveaway document does not contain the field.

---

# 9.6 Successful Entry Processing

After successful validation:

```text
Participation Request
        |
        v
Authentication
        |
        v
Giveaway Validation
        |
        v
User Validation
        |
        v
Existing Participation Check
        |
        v
Entry Fee Validation
        |
        v
Wallet Validation
        |
        v
Idempotency Check
        |
        v
Fraud Check
        |
        v
Wallet Deduction
        |
        v
EntryTransaction
        |
        v
GiveawayParticipation
        |
        v
GiveawayEntry
        |
        v
Audit Log
```

## Success Response

Example:

```json
{
  "success": true,
  "message": "Giveaway entered successfully"
}
```

---

# 10. Idempotency

## 10.1 Purpose

Idempotency prevents duplicate processing when a request is sent multiple times.

Duplicate requests can happen because of:

- Double-clicking Join.
- Network retries.
- Browser refresh.
- Multiple tabs.
- Client-side retry logic.

The system must not deduct the wallet multiple times for the same participation request.

---

# 10.2 Idempotency Flow

```text
First Request
     |
     v
Validation
     |
     v
Participation Created
     |
     v
Wallet Deducted
     |
     v
Transaction Created


Second Request
     |
     v
Same Idempotency Key
     |
     v
Duplicate Detected
     |
     v
Request Rejected
```

## Duplicate Response

```json
{
  "success": false,
  "message": "Duplicate participation request",
  "requestId": "request-id"
}
```

---

# 11. Entry Transaction

The entry transaction records the wallet operation associated with giveaway participation.

## EntryTransaction Fields

```text
user
giveaway
entry
type
currency
amount
balanceBefore
balanceAfter
status
requestId
idempotencyKey
```

## Transaction Type

```text
entry_fee
```

## Currency

```text
VE
```

## Transaction Status

Possible values:

```text
pending
completed
failed
reversed
```

---

# 12. Giveaway History

# 12.1 Get My Giveaway History

## Endpoint

```http
GET /api/giveaways/history
```

## Authentication

Required.

## Headers

```text
Authorization: Bearer <JWT_TOKEN>
```

## Description

Returns giveaway participation history for the authenticated user.

## Success Response

```json
{
  "success": true,
  "data": []
}
```

---

# 13. Giveaway Result

# 13.1 Get My Giveaway Result

## Endpoint

```http
GET /api/giveaways/:id/result
```

## Authentication

Required.

## Headers

```text
Authorization: Bearer <JWT_TOKEN>
```

## Description

Returns the authenticated user's result for a giveaway.

Possible result states include:

```text
not_participated
waiting
winner
non_winner
```

## Example

```json
{
  "success": true,
  "data": {
    "result": "waiting"
  }
}
```

> The exact response structure is determined by the current result controller.

---

# 14. Winner APIs

# 14.1 Get Giveaway Winners

## Endpoint

```http
GET /api/giveaways/:id/winners
```

## Authentication

Public.

## Description

Returns winner records for the specified giveaway.

## Success Response

```json
{
  "success": true,
  "data": []
}
```

---

# 14.2 Get Giveaway Winner

## Endpoint

```http
GET /api/giveaways/:id/winner
```

## Authentication

Public.

## Description

Returns the selected winner for a completed giveaway.

A winner may not exist yet when:

- Giveaway is still active.
- Giveaway has not ended.
- Winner detection has not been performed.

---

# 15. Admin Winner Detection

# 15.1 Detect Winner

## Endpoint

```http
POST /api/giveaways/:id/detect-winner
```

## Authentication

Required.

## Authorization

Admin only.

## Header

```text
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

## Description

Selects an eligible winner after the giveaway has ended.

---

# 15.2 Winner Detection Validation

The backend validates:

1. Giveaway ID.
2. Giveaway existence.
3. Giveaway status.
4. Giveaway end date.
5. Existing winner state.
6. Active participants.
7. Fraud events.
8. Suspicious participants.
9. Blocked participants.
10. Eligible entries.

---

# 15.3 Winner Selection Flow

```text
Giveaway Ends
      |
      v
Admin Detects Winner
      |
      v
Validate Giveaway
      |
      v
Find Eligible Participants
      |
      v
Check Fraud Events
      |
      v
Exclude Blocked/Suspicious Participants
      |
      v
Select Eligible Entry
      |
      v
Create GiveawayWinner
      |
      v
Mark Giveaway Completed
      |
      v
Update Participation
      |
      v
Create Audit Logs
```

---

# 15.4 GiveawayWinner

Winner information contains:

```text
userId
giveawayId
prizeId
prizeName
prizeCategory
winnerStatus
selectedAt
claimDeadline
claimStatus
```

## Winner Status

```text
selected
confirmed
claimed
expired
```

## Claim Status

```text
not_submitted
submitted
processing
completed
expired
```

---

# 16. Prize Claim APIs

# 16.1 Submit Prize Claim

## Endpoint

```http
POST /api/giveaways/:id/claim
```

## Authentication

Required.

## Headers

```text
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
Idempotency-Key: <UNIQUE_CLAIM_KEY>
```

## Description

Allows an authenticated winner to submit prize claim information.

Prize claims are available only after:

1. Giveaway completion.
2. Winner verification.
3. Claim deadline validation.

---

# 16.2 Claim Validation

The backend checks:

1. Giveaway ID.
2. Giveaway existence.
3. Giveaway completion.
4. Authenticated user.
5. Winner record.
6. Winner status.
7. Claim deadline.
8. Existing claim.
9. Idempotency.
10. Prize type.
11. Required claim information.

---

# 16.3 Physical Prize Claim

Example request:

```json
{
  "recipientName": "Aquib Malik",
  "phone": "9876543210",
  "address": "Example Address",
  "city": "Khargone",
  "state": "Madhya Pradesh",
  "pin": "451001"
}
```

The backend validates the required fields.

---

# 16.4 Digital/Gift Card Claim

Example:

```json
{
  "email": "aquib@example.com"
}
```

---

# 16.5 General Prize Claim

Example:

```json
{
  "recipientName": "Aquib Malik",
  "email": "aquib@example.com"
}
```

The actual required fields depend on the backend prize type.

---

# 16.6 Claim Processing

```text
Winner
  |
  v
Submit Claim
  |
  v
Authentication
  |
  v
Check Giveaway Completed
  |
  v
Verify Winner
  |
  v
Check Claim Deadline
  |
  v
Validate Claim Information
  |
  v
Idempotency Check
  |
  v
Create PrizeClaim
  |
  v
Update GiveawayWinner
  |
  v
Audit
  |
  v
Claim Submitted
```

---

# 17. Get My Prize Claim

## Endpoint

```http
GET /api/giveaways/:id/my-claim
```

## Authentication

Required.

## Headers

```text
Authorization: Bearer <JWT_TOKEN>
```

## Description

Returns the authenticated user's claim information/status for the giveaway.

## Example

```json
{
  "success": true,
  "data": {
    "status": "submitted",
    "prizeName": "iPhone 17",
    "prizeType": "physical"
  }
}
```

Sensitive information should not be unnecessarily returned.

---

# 18. Prize Claim Status

A prize claim can have:

```text
submitted
processing
completed
rejected
expired
```

The winner record separately tracks claim status:

```text
not_submitted
submitted
processing
completed
expired
```

---

# 19. Expired Prize Claim

```text
Claim Request
      |
      v
Check Claim Deadline
      |
      v
Deadline Passed
      |
      v
Claim Rejected
      |
      v
Winner Expired
```

Example:

```json
{
  "success": false,
  "message": "Prize claim deadline has expired"
}
```

---

# 20. Fraud Protection

Fraud protection is integrated into giveaway participation before wallet deduction.

## Possible Signals

- Device hash
- IP address
- Account age
- Participation history
- Request frequency
- Repeated failures
- Multiple-account patterns
- Abnormal participation behavior

---

# 21. Fraud Risk Bands

The planned risk ranges are:

| Risk Score | Risk Level |
|---:|---|
| 0–29 | LOW |
| 30–59 | MEDIUM |
| 60–79 | HIGH |
| 80–100 | CRITICAL |

---

# 22. Fraud Actions

Possible actions include:

```text
ALLOW
FLAGGED
BLOCKED
REVIEW
```

A single signal should not automatically prove fraudulent behavior.

---

# 23. Device Security

The frontend generates a device identifier.

Example:

```text
X-Veloop-Device-Id: <DEVICE_ID>
```

The backend device security middleware can derive a protected device hash.

The device hash can be used as one signal in the fraud/security system.

The device identifier is not an authentication credential.

---

# 24. Security Middleware

## Authentication Middleware

Responsible for:

- Reading JWT
- Validating JWT
- Identifying authenticated user
- Rejecting unauthenticated requests

---

## Admin Middleware

Responsible for:

- Checking authenticated user
- Checking user role
- Allowing admin-only operations

---

## Device Security Middleware

Responsible for:

- Reading device identifier
- Creating/providing protected device information
- Supporting fraud/security checks

---

## Rate Limiting

Rate limiting reduces:

- Excessive requests
- Repeated participation attempts
- Abuse
- Automated request flooding

---

## Helmet

Helmet provides HTTP security headers.

---

## CORS

CORS controls permitted frontend origins and HTTP methods/headers.

---

# 25. API Endpoint Summary

| Endpoint | Method | Authentication | Admin |
|---|---|---|---|
| `/api/auth/register` | POST | No | No |
| `/api/auth/login` | POST | No | No |
| `/api/giveaways/current` | GET | No | No |
| `/api/giveaways` | GET | No | No |
| `/api/giveaways/previous` | GET | No | No |
| `/api/giveaways/:id` | GET | No | No |
| `/api/giveaways/:id/winners` | GET | No | No |
| `/api/giveaways/:id/winner` | GET | No | No |
| `/api/giveaways/history` | GET | Yes | No |
| `/api/giveaways/:id/result` | GET | Yes | No |
| `/api/giveaways/:id/my-claim` | GET | Yes | No |
| `/api/giveaways/:id/claim` | POST | Yes | No |
| `/api/giveaways/:id/entry-status` | GET | Yes | No |
| `/api/giveaways/:id/enter` | POST | Yes | No |
| `/api/giveaways/:id/detect-winner` | POST | Yes | Yes |

---

# 26. Common Error Responses

## Invalid Giveaway ID

```json
{
  "success": false,
  "message": "Invalid giveaway ID"
}
```

---

## Authentication Required

```json
{
  "success": false,
  "message": "Authentication required"
}
```

---

## Admin Access Required

```json
{
  "success": false,
  "message": "Admin access required."
}
```

---

## Giveaway Not Found

```json
{
  "success": false,
  "message": "Giveaway not found"
}
```

---

## Duplicate Participation

```json
{
  "success": false,
  "message": "Duplicate participation request"
}
```

---

## Claim Before Completion

```json
{
  "success": false,
  "message": "Prize claims are available only after the giveaway is completed.",
  "code": "CLAIM_NOT_ALLOWED"
}
```

---

## Rate Limit

```json
{
  "success": false,
  "message": "Too many giveaway join attempts. Please try again later."
}
```

---

# 27. Request Flow

A normal authenticated participation request flows through:

```text
Frontend
   |
   v
JWT + Device ID + Idempotency Key
   |
   v
Express
   |
   v
Security Middleware
   |
   v
Authentication Middleware
   |
   v
Rate Limiter
   |
   v
Giveaway Controller
   |
   v
Business Validation
   |
   v
Fraud Check
   |
   v
MongoDB Transaction
   |
   +--> Wallet Update
   |
   +--> EntryTransaction
   |
   +--> GiveawayParticipation
   |
   +--> GiveawayEntry
   |
   +--> Audit Log
   |
   v
Response
```

---

# 28. Winner Detection Request Flow

```text
Admin
  |
  v
POST /api/giveaways/:id/detect-winner
  |
  v
JWT Validation
  |
  v
Admin Authorization
  |
  v
Giveaway Validation
  |
  v
Check Giveaway Ended
  |
  v
Find Active Participants
  |
  v
Check Fraud Events
  |
  v
Exclude Blocked Participants
  |
  v
Find Eligible Entries
  |
  v
Random Winner Selection
  |
  v
Create GiveawayWinner
  |
  v
Complete Giveaway
  |
  v
Update Participation
  |
  v
Audit
```

---

# 29. Prize Claim Request Flow

```text
Winner
  |
  v
POST /api/giveaways/:id/claim
  |
  v
JWT Validation
  |
  v
Giveaway Completed?
  |
  v
Winner Verified?
  |
  v
Claim Deadline Valid?
  |
  v
Claim Information Valid?
  |
  v
Idempotency Check
  |
  v
Create PrizeClaim
  |
  v
Update GiveawayWinner
  |
  v
Audit
  |
  v
Claim Submitted
```

---

# 30. Postman Testing

Recommended testing sequence:

## Step 1 — Register

```http
POST /api/auth/register
```

Body:

```json
{
  "name": "Aquib Malik",
  "email": "aquib@example.com",
  "password": "Password123"
}
```

---

## Step 2 — Login

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "aquib@example.com",
  "password": "Password123"
}
```

Copy the JWT token.

---

## Step 3 — Get Current Giveaway

```http
GET /api/giveaways/current
```

No authentication required.

---

## Step 4 — Check Entry Status

```http
GET /api/giveaways/:id/entry-status
```

Header:

```text
Authorization: Bearer <JWT_TOKEN>
```

---

## Step 5 — Enter Giveaway

```http
POST /api/giveaways/:id/enter
```

Headers:

```text
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
Idempotency-Key: unique-request-key
X-Veloop-Device-Id: device-id
```

Body:

```json
{}
```

---

## Step 6 — Test Duplicate Request

Send the same participation request again with the same idempotency key.

The system should prevent duplicate processing.

---

## Step 7 — Test Invalid Giveaway ID

```http
POST /api/giveaways/123/enter
```

Expected:

```json
{
  "success": false,
  "message": "Invalid giveaway ID"
}
```

---

## Step 8 — Test Unauthorized Request

Call:

```http
GET /api/giveaways/:id/entry-status
```

without:

```text
Authorization
```

Expected:

```json
{
  "success": false,
  "message": "Authentication required"
}
```

---

## Step 9 — Test Winner Detection

Use an admin JWT:

```http
POST /api/giveaways/:id/detect-winner
```

Header:

```text
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

---

## Step 10 — Test Result

```http
GET /api/giveaways/:id/result
```

Header:

```text
Authorization: Bearer <JWT_TOKEN>
```

---

## Step 11 — Test Prize Claim

```http
POST /api/giveaways/:id/claim
```

Header:

```text
Authorization: Bearer <JWT_TOKEN>
```

---

# 31. Security Rules

The backend must remain authoritative.

Never trust the client for:

```text
wallet balance
winner status
giveaway completion
fraud status
entry fee
user ID
admin role
eligibility
```

These values must be obtained or validated by the backend.

---

# 32. API Documentation Maintenance

Whenever an API changes, update this document.

When adding a new endpoint, document:

1. HTTP method.
2. Endpoint.
3. Authentication.
4. Authorization.
5. Headers.
6. URL parameters.
7. Request body.
8. Validation rules.
9. Success response.
10. Error responses.
11. Security behavior.
12. Idempotency behavior.
13. Rate-limiting behavior when applicable.

---

# 33. API Summary

```text
AUTH
 |
 +-- Register
 |
 +-- Login


GIVEAWAYS
 |
 +-- Current Giveaway
 |
 +-- All Giveaways
 |
 +-- Previous Giveaways
 |
 +-- Giveaway Details


PARTICIPATION
 |
 +-- Enter Giveaway
 |
 +-- Entry Status
 |
 +-- Giveaway History


RESULT
 |
 +-- My Result


WINNER
 |
 +-- Winners
 |
 +-- Winner
 |
 +-- Detect Winner


CLAIM
 |
 +-- Submit Claim
 |
 +-- My Claim
```

---

# 34. Complete Application Flow

```text
USER
 |
 v
REGISTER
 |
 v
LOGIN
 |
 v
JWT GENERATED
 |
 v
GIVEAWAY HOME
 |
 v
PRIZE DETAILS
 |
 v
GIVEAWAY DETAILS
 |
 v
RULES & ELIGIBILITY
 |
 v
BALANCE VERIFICATION
 |
 v
CONFIRM JOIN
 |
 v
JWT AUTHENTICATION
 |
 v
GIVEAWAY VALIDATION
 |
 v
USER VALIDATION
 |
 v
PARTICIPATION CHECK
 |
 v
ENTRY FEE VALIDATION
 |
 v
WALLET VALIDATION
 |
 v
IDEMPOTENCY CHECK
 |
 v
FRAUD CHECK
 |
 v
WALLET DEDUCTION
 |
 v
ENTRY TRANSACTION
 |
 v
PARTICIPATION
 |
 v
GIVEAWAY ENTRY
 |
 v
AUDIT LOG
 |
 v
PARTICIPATION SUCCESSFUL
 |
 v
GIVEAWAY ENDS
 |
 v
ADMIN DETECTS WINNER
 |
 v
FRAUD CHECK
 |
 v
ELIGIBLE PARTICIPANTS
 |
 v
RANDOM WINNER
 |
 v
GIVEAWAY WINNER
 |
 +----------------------+
 |                      |
 v                      v
WINNER              NON-WINNER
 |
 v
SUBMIT CLAIM
 |
 v
CLAIM VALIDATION
 |
 v
PRIZE CLAIM
 |
 v
PRIZE PROCESSING
```

---

# 35. Conclusion

The VELOOP Giveaway API is designed around secure backend-controlled giveaway participation.

The backend validates important business rules instead of trusting frontend values.

The application combines:

- JWT authentication
- Role-based authorization
- MongoDB transactions
- Wallet validation
- Idempotency
- Rate limiting
- Device security
- Fraud protection
- Winner selection
- Prize claims
- Audit logging

This architecture helps maintain consistency, security and traceability across the complete giveaway lifecycle.