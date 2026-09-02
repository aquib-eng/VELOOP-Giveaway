# VELOOP Giveaway

A full-stack giveaway platform built using React.js, Node.js, Express.js, MongoDB and JWT authentication.

VELOOP Giveaway allows users to view active giveaways, check prize details, review rules and eligibility, securely participate using their wallet balance, track participation, view winner/non-winner results, and allow winners to submit prize claims.

The backend is the source of truth for all important giveaway, wallet, participation, eligibility, fraud, winner-selection and prize-claim decisions.

---

# 1. Project Overview

VELOOP Giveaway is a secure full-stack giveaway management application.

The application consists of three major parts:

### Frontend

The frontend is built using React.js and Vite.

It provides the user interface for:

- Registration
- Login
- Giveaway Home
- Prize details
- Giveaway details
- Entry fee information
- Rules and Terms
- Eligibility information
- Wallet balance
- Giveaway participation
- Confirmation modal
- Participation status
- Winner result
- Non-winner result
- Prize claim
- Dashboard
- Giveaway history

### Backend

The backend is built using Node.js and Express.js.

It handles:

- Authentication
- JWT verification
- Authorization
- Giveaway APIs
- Giveaway participation
- Wallet validation
- Entry fee deduction
- Entry transactions
- Idempotency
- Device security
- Fraud protection
- Winner selection
- Prize claims
- Audit logging
- Result handling
- Rate limiting
- Error handling

### Database

MongoDB is used as the primary database.

Mongoose is used as the ODM.

The database stores:

- Users
- Giveaways
- Giveaway entries
- Giveaway participation
- Entry transactions
- Giveaway winners
- Prize claims
- Fraud events
- Audit logs

---

# 2. Features

## Authentication

The application provides:

- User registration
- User login
- JWT authentication
- Protected APIs
- Admin authorization
- User account status validation
- Password hashing

---

## Giveaway Management

The application provides:

- Current giveaway
- All giveaways
- Previous giveaways
- Giveaway details
- Prize details
- Prize value
- Entry fee
- Giveaway start date
- Giveaway end date
- Giveaway status
- Maximum entries per user
- Published/unpublished state

---

## Secure Giveaway Participation

Before allowing participation, the backend validates:

1. Giveaway ID
2. Giveaway existence
3. Giveaway status
4. Giveaway start date
5. Giveaway end date
6. User authentication
7. User account status
8. User eligibility
9. Existing participation
10. Entry fee
11. Wallet balance
12. Idempotency
13. Fraud risk
14. Participation permission

---

## Wallet and Transactions

The application provides:

- Wallet balance validation
- Entry fee deduction
- Balance-before tracking
- Balance-after tracking
- Entry transaction records
- Transaction status
- Duplicate transaction protection

---

## Fraud Protection

The system can evaluate multiple security signals, including:

- Device information
- Device hash
- IP address
- Account age
- Participation history
- Request frequency
- Repeated failed requests
- Multiple-account patterns
- Abnormal participation patterns

A single signal should not automatically prove fraud.

---

## Winner Selection

The system provides:

- Giveaway completion validation
- Eligible participant filtering
- Fraud-event checking
- Suspicious participant exclusion
- Random winner selection
- GiveawayWinner creation
- Giveaway completion
- Participation status update
- Audit logging

---

## Prize Claims

The system provides:

- Winner verification
- Claim deadline checking
- Claim information validation
- Prize type validation
- Claim creation
- Idempotency
- Winner claim-status update
- Expired claim handling

---

# 3. Technology Stack

## Frontend

- React.js
- Vite
- React Router
- JavaScript
- JSX
- HTML5
- CSS3
- Fetch API

## Backend

- Node.js
- Express.js
- JWT
- bcrypt
- Mongoose
- express-rate-limit
- Helmet
- CORS
- Cookie Parser

## Database

- MongoDB
- MongoDB Atlas
- Mongoose

## Development Tools

- Git
- GitHub
- VS Code
- Postman
- npm

## Deployment

The application can be deployed using:

- Vercel
- Netlify
- Node.js-compatible backend hosting
- MongoDB Atlas

---

# 4. Project Structure

```text
VELOOP-Giveaway/
│
├── README.md
│
├── backend/
│   │
│   ├── API_DOCUMENTATION.md
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── server.js
│   │
│   └── src/
│       │
│       ├── app.js
│       │
│       ├── config/
│       │   └── db.js
│       │
│       ├── controllers/
│       │   ├── giveawayController.js
│       │   ├── winnerController.js
│       │   ├── claimController.js
│       │   └── resultController.js
│       │
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   ├── adminMiddleware.js
│       │   ├── deviceSecurityMiddleware.js
│       │   └── requestIdMiddleware.js
│       │
│       ├── models/
│       │   ├── User.js
│       │   ├── Giveaway.js
│       │   ├── GiveawayEntry.js
│       │   ├── GiveawayParticipation.js
│       │   ├── GiveawayWinner.js
│       │   ├── EntryTransaction.js
│       │   ├── PrizeClaim.js
│       │   ├── FraudEvent.js
│       │   └── AuditLog.js
│       │
│       ├── routes/
│       │   ├── authRoutes.js
│       │   └── giveawayRoutes.js
│       │
│       └── services/
│           ├── fraudService.js
│           └── auditService.js
│
└── frontend/
    │
    ├── .env
    ├── .env.example
    ├── package.json
    ├── vite.config.js
    │
    └── src/
        │
        ├── components/
        ├── controllers/
        ├── pages/
        ├── services/
        ├── utils/
        ├── App.jsx
        └── main.jsx
```

---

# 5. System Architecture

VELOOP follows a frontend → backend API → database architecture.

```text
                     USER
                       |
                       v
                React Frontend
                       |
                       v
                  REST APIs
                       |
                       v
                Express Backend
                       |
        +--------------+--------------+
        |              |              |
        v              v              v
 Authentication   Validation     Security/Fraud
        |              |              |
        +--------------+--------------+
                       |
                       v
                  Controllers
                       |
                       v
                    Services
                       |
                       v
                    Mongoose
                       |
                       v
                 MongoDB Atlas
```

## Architecture Explanation

### React Frontend

Responsible for:

- User interface
- Navigation
- Forms
- API calls
- Loading states
- Error states
- Confirmation UI
- Result UI

### Express Backend

Responsible for:

- Business logic
- Authentication
- Authorization
- Validation
- Wallet operations
- Participation
- Fraud protection
- Winner selection
- Prize claims

### MongoDB

Responsible for persistent application data.

---

# 6. Authentication Flow

```text
User
 |
 v
Register
 |
 v
Login
 |
 v
Backend validates credentials
 |
 v
JWT token generated
 |
 v
Frontend stores token
 |
 v
Frontend sends token
 |
 v
Authentication Middleware
 |
 v
Protected API
```

## Authentication Description

1. User registers an account.
2. Backend validates registration information.
3. Password is securely hashed.
4. User logs in.
5. Backend validates email and password.
6. Backend generates a JWT.
7. Frontend stores the JWT token.
8. Frontend sends the JWT with protected API requests.
9. Authentication middleware verifies the JWT.
10. The request is allowed when authentication is valid.

Protected operations include:

- Joining a giveaway
- Checking entry status
- Viewing giveaway history
- Viewing personal result
- Submitting a prize claim

---

# 7. Giveaway User Flow

```text
Giveaway Home
      |
      v
Prize Details
      |
      v
Individual Giveaway Page
      |
      v
Entry Fee
      |
      v
Rules & Terms
      |
      v
Eligibility
      |
      v
Balance Verification
      |
      v
Confirmation Modal
      |
      v
Confirm & Join
      |
      v
Backend Validation
      |
      v
Fraud Protection
      |
      v
Wallet Deduction
      |
      v
Participation Created
      |
      v
Participation Successful
      |
      v
Wait for Giveaway Completion
      |
      v
Winner Selection
      |
      +----------------------+
      |                      |
      v                      v
   Winner                Non-Winner
      |
      v
Claim Prize
      |
      v
Prize Processing
```

## Giveaway Flow Explanation

The user starts from the Giveaway Home page.

The user views the prize and opens the individual giveaway page.

The individual giveaway page displays:

- Prize
- Prize value
- Entry fee
- Giveaway dates
- Rules
- Terms
- Eligibility
- Participation status

The user confirms participation.

The frontend sends a participation request to the backend.

The backend independently validates the request.

If participation is allowed:

1. Wallet balance is verified.
2. Entry fee is deducted.
3. Entry transaction is created.
4. Giveaway participation is created.
5. Giveaway entry is created.
6. Audit information is recorded.

The user receives a successful participation response.

After the giveaway ends, winner detection can be performed.

The user receives either:

- Winner result
- Non-winner result

A winner can submit a prize claim.

---

# 8. Secure Giveaway Entry Flow

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

## Backend Source of Truth

The frontend must not be trusted for important business values.

The backend determines:

- User identity
- Giveaway status
- Entry fee
- Wallet balance
- Eligibility
- Participation status
- Fraud status
- Winner status

## Secure Processing

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
Transaction Creation
        |
        v
Participation Creation
        |
        v
Entry Creation
        |
        v
Audit Log
```

---

# 9. Device & Fraud Protection Flow

```text
Frontend
   |
   v
Generate Device ID
   |
   v
Store Device ID
   |
   v
Send Device ID
   |
   v
Backend
   |
   v
Device Security Middleware
   |
   v
Create Device Hash
   |
   v
Security / Fraud System
```

## Fraud Signals

Possible signals include:

- Device hash
- IP address
- Account age
- Participation history
- Request frequency
- Repeated failed requests
- Multiple-account behavior
- Abnormal participation patterns

## Risk-Based Approach

A single signal should not automatically prove fraud.

For example, multiple users may legitimately use the same IP address because of:

- Shared Wi-Fi
- Office networks
- College networks
- Family networks
- Public networks

Therefore, IP should be considered together with other signals.

## Fraud Flow

```text
Participation Request
        |
        v
Collect Security Signals
        |
        v
Calculate Risk
        |
        v
LOW / MEDIUM / HIGH / CRITICAL
        |
        +----------------------------+
        |                            |
        v                            v
Allowed / Flagged              Blocked / Review
```

Fraud checks are performed before wallet deduction.

Suspicious or blocked participation should not receive additional rewards or entries.

---

# 10. Winner Selection Flow

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

## Winner Selection Process

The backend:

1. Validates giveaway ID.
2. Finds the giveaway.
3. Confirms that the giveaway has ended.
4. Prevents duplicate winner selection.
5. Finds active participants.
6. Checks fraud events.
7. Excludes blocked or suspicious participants.
8. Finds eligible giveaway entries.
9. Randomly selects an eligible entry.
10. Creates a `GiveawayWinner`.
11. Marks the giveaway as completed.
12. Updates participation status.
13. Creates audit logs.

---

# 11. Prize Claim Flow

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
Create PrizeClaim
  |
  v
Update Winner
  |
  v
Claim Submitted
```

## Claim Expiry

```text
Claim Request
      |
      v
Deadline Check
      |
      v
Expired
      |
      v
Claim Rejected
      |
      v
Winner Expired
```

## Claim Validation

For physical prizes, information may include:

- Recipient name
- Phone
- Address
- City
- State
- PIN

For digital or gift-card prizes:

- Email

For general prizes:

- Recipient name
- Email

The backend determines the actual required fields based on prize type.

---

# 12. Database Models

MongoDB is used as the database and Mongoose is used for schema and model management.

---

## User

Stores user authentication, account and wallet information.

Important fields:

- `name`
- `email`
- `password`
- `role`
- `status`
- `walletBalance`
- `referralCode`
- `referredBy`
- `isEmailVerified`
- `lastLoginAt`

---

## Giveaway

Stores giveaway configuration.

Important fields:

- `title`
- `description`
- `prize`
- `entryFee`
- `startDate`
- `endDate`
- `status`
- `maxEntriesPerUser`
- `isPublished`
- `completedAt`
- `winnerSelectedAt`

---

## GiveawayEntry

Represents a user's giveaway entry.

Important fields:

- `giveaway`
- `user`
- `enteredAt`

A unique index helps prevent duplicate entries for the same user and giveaway.

---

## GiveawayParticipation

Stores participation state.

Important fields:

- `userId`
- `giveawayId`
- `prizeId`
- `entryCurrency`
- `entryAmount`
- `deviceHash`
- `status`
- `joinedAt`
- `transactionId`

Possible participation states include:

- `pending`
- `active`
- `completed`
- `flagged`
- `blocked`
- `cancelled`

---

## EntryTransaction

Stores wallet entry-fee transactions.

Important fields:

- `user`
- `giveaway`
- `entry`
- `type`
- `currency`
- `amount`
- `balanceBefore`
- `balanceAfter`
- `status`
- `requestId`
- `idempotencyKey`

---

## GiveawayWinner

Stores selected winner information.

Important fields:

- `userId`
- `giveawayId`
- `prizeId`
- `prizeName`
- `prizeCategory`
- `winnerStatus`
- `selectedAt`
- `claimDeadline`
- `claimStatus`

Winner status values include:

```text
selected
confirmed
claimed
expired
```

Claim status values include:

```text
not_submitted
submitted
processing
completed
expired
```

---

## PrizeClaim

Stores winner prize-claim information.

Important fields:

- `userId`
- `giveawayId`
- `winnerId`
- `prizeName`
- `prizeType`
- `status`
- `idempotencyKey`
- `recipientName`
- `phone`
- `address`
- `city`
- `state`
- `pin`
- `email`
- `processedAt`
- `completedAt`
- `rejectionReason`

---

## FraudEvent

Stores suspicious participation and fraud-related information.

Typical information includes:

- User
- Giveaway
- Device hash
- Risk score
- Reason
- Security signals
- Action

---

## AuditLog

Stores important business and security actions.

Examples include:

- Login
- Giveaway participation
- Wallet transaction
- Fraud event
- Giveaway completion
- Winner selection
- Prize claim

---

# 13. API Overview

The detailed API documentation is available in:

```text
backend/API_DOCUMENTATION.md
```

Main API groups:

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

## Giveaways

```text
GET /api/giveaways/current
GET /api/giveaways
GET /api/giveaways/previous
GET /api/giveaways/:id
```

## Participation

```text
POST /api/giveaways/:id/enter
GET /api/giveaways/:id/entry-status
GET /api/giveaways/history
```

## Results

```text
GET /api/giveaways/:id/result
```

## Winners

```text
GET /api/giveaways/:id/winners
GET /api/giveaways/:id/winner
POST /api/giveaways/:id/detect-winner
```

## Prize Claims

```text
GET /api/giveaways/:id/my-claim
POST /api/giveaways/:id/claim
```

For detailed:

- Request bodies
- Headers
- Authentication
- Authorization
- Validation
- Responses
- Errors
- Security
- Idempotency
- Postman testing

see:

```text
backend/API_DOCUMENTATION.md
```

---

# 14. Environment Variables

## Backend

Create:

```text
backend/.env
```

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
DEVICE_HASH_SECRET=your_device_hash_secret
WINNER_CLAIM_DAYS=7
NODE_ENV=development
```

## Frontend

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_URL=http://localhost:5000/api
```

## Security Rule

Never commit real secrets to GitHub.

The following should normally be ignored:

```text
.env
.env.local
.env.production
```

Only example configuration should be committed:

```text
.env.example
```

---

# 15. Installation

## Prerequisites

Install:

- Node.js
- npm
- Git
- MongoDB Atlas account
- VS Code
- Postman

---

## Clone Repository

```bash
git clone https://github.com/aquib-eng/VELOOP-Giveaway.git
```

Then:

```bash
cd VELOOP-Giveaway
```

---

## Backend Installation

```bash
cd backend
npm install
```

Create:

```text
backend/.env
```

Add the required environment variables.

---

## Frontend Installation

Open another terminal:

```bash
cd frontend
npm install
```

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_URL=http://localhost:5000/api
```

---

# 16. Running the Project

## Start Backend

From:

```text
VELOOP-Giveaway/backend
```

run:

```bash
npm start
```

Backend:

```text
http://localhost:5000
```

---

## Start Frontend

From:

```text
VELOOP-Giveaway/frontend
```

run:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Local Development Architecture

```text
Browser
   |
   v
React + Vite
   |
   | HTTP Requests
   v
Express API
   |
   v
MongoDB Atlas
```

---

# 17. Testing

## Manual Frontend Testing

Test the following:

- Registration
- Login
- Logout
- Giveaway home
- Giveaway details
- Prize details
- Entry fee
- Rules
- Eligibility
- Entry status
- Giveaway participation
- Confirmation modal
- Wallet validation
- Duplicate participation
- Winner result
- Non-winner result
- Prize claim

---

## API Testing

Postman can be used to test:

- Public APIs
- Protected APIs
- Admin APIs
- Invalid IDs
- Unauthorized requests
- Duplicate participation
- Idempotency
- Insufficient balance
- Expired giveaways
- Winner detection
- Prize claims

---

## Security Testing

Verify that:

- Protected APIs reject unauthenticated requests.
- Invalid JWT tokens are rejected.
- Non-admin users cannot detect winners.
- Invalid giveaway IDs are rejected.
- Duplicate participation is prevented.
- Duplicate idempotency keys are handled.
- Insufficient wallet balance prevents participation.
- Expired giveaways cannot be joined.
- Claims cannot be submitted before completion.
- Non-winners cannot submit claims.
- Expired claims are rejected.
- Blocked/suspicious participants are excluded from winner selection.

---

# 18. Deployment

## Backend Deployment

1. Push the backend to GitHub.
2. Create a Node.js backend service on the selected hosting provider.
3. Configure environment variables.
4. Configure MongoDB Atlas.
5. Configure CORS with the production frontend URL.
6. Start the backend server.
7. Test the production API.

Production environment example:

```env
PORT=5000
MONGO_URI=production_mongodb_connection
JWT_SECRET=production_secret
FRONTEND_URL=https://your-frontend-domain
DEVICE_HASH_SECRET=production_device_secret
WINNER_CLAIM_DAYS=7
NODE_ENV=production
```

---

## Frontend Deployment

1. Build the React application.
2. Deploy using Vercel or Netlify.
3. Configure:

```env
VITE_API_URL=https://your-backend-domain/api
```

4. Deploy.
5. Test frontend-to-backend communication.

---

## Production Architecture

```text
User
 |
 v
Production React Frontend
 |
 v
Production Express Backend
 |
 v
MongoDB Atlas
```

---

# 19. Security

VELOOP uses multiple security layers.

## JWT Authentication

JWT protects authenticated APIs.

---

## Authorization

Admin-only APIs require the admin role.

---

## Password Security

Passwords must not be stored as plain text.

Passwords should be securely hashed before being stored.

---

## Helmet

Helmet is used to provide HTTP security headers.

---

## CORS

CORS controls which frontend origins can communicate with the backend.

---

## Rate Limiting

Rate limiting protects the API against excessive or abusive requests.

Giveaway participation has additional rate limiting.

---

## Idempotency

Idempotency prevents duplicate participation and duplicate wallet deductions caused by repeated requests.

---

## Device Security

The frontend generates a device identifier.

The backend can use the identifier to create a protected device hash.

Device information is one input into the security/fraud system.

---

## Fraud Protection

Fraud decisions should use multiple signals.

One signal alone should not automatically establish fraud.

---

## Backend Source of Truth

The backend determines:

- User identity
- Giveaway status
- Entry fee
- Wallet balance
- Eligibility
- Participation status
- Fraud status
- Winner selection
- Claim eligibility

---

## Wallet Security

Wallet operations should be processed safely using database transactions where supported.

---

## Audit Logging

Important business and security events should be logged for traceability.

---

## Sensitive Information

Sensitive prize-claim information should not be unnecessarily exposed in API responses.

---

# 20. Future Improvements

Possible future improvements include:

- Email verification
- Password reset
- Refresh tokens
- Admin dashboard
- Giveaway creation UI
- Giveaway editing UI
- Advanced fraud scoring
- Device reputation
- Analytics dashboard
- Email notifications
- SMS notifications
- Automated winner selection
- Automated claim-expiry jobs
- Payment gateway integration
- Advanced wallet ledger
- Automated fraud monitoring
- Comprehensive automated tests
- GitHub Actions CI/CD
- Docker deployment
- Kubernetes deployment
- Production monitoring
- Centralized logging
- API versioning

---

# Project Completion Checklist

## Backend

- [x] Express server
- [x] MongoDB connection
- [x] Authentication
- [x] JWT protection
- [x] Giveaway APIs
- [x] Participation APIs
- [x] Wallet validation
- [x] Entry transactions
- [x] Idempotency
- [x] Device security
- [x] Fraud protection
- [x] Audit logging
- [x] Winner selection
- [x] Prize claims
- [x] Result API
- [x] Rate limiting
- [x] Security middleware

## Frontend

- [x] React application
- [x] Vite
- [x] Authentication pages
- [x] Giveaway Home
- [x] Giveaway Details
- [x] Prize details
- [x] Participation flow
- [x] Entry status
- [x] Confirmation modal
- [x] Result flow
- [x] Prize claim flow
- [x] Responsive UI

## Documentation

- [x] README
- [x] API documentation
- [x] Environment documentation
- [x] Installation instructions
- [x] Running instructions
- [x] Testing instructions
- [x] Deployment instructions
- [x] Security documentation

---

# Author

## Aquib Malik

VELOOP Giveaway Full-Stack Project