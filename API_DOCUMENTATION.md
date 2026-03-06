# Sharyan - Blood Donation Platform API Documentation

**Base URL:** `http://localhost:3000/api/v1`
**Swagger Docs:** `http://localhost:3000/docs`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Admin Management](#2-admin-management)
3. [Donors](#3-donors)
4. [Patients](#4-patients)
5. [Blood Banks](#5-blood-banks)
6. [Blood Requests](#6-blood-requests)
7. [Donation Offers](#7-donation-offers)
8. [Donations](#8-donations)
9. [Blood Stock](#9-blood-stock)
10. [Campaigns](#10-campaigns)
11. [Notifications](#11-notifications)
12. [Chat](#12-chat)
13. [Gamification](#13-gamification)
14. [Share](#14-share)
15. [WebSocket Events](#15-websocket-events)
16. [Enums Reference](#16-enums-reference)
17. [Standard Response Format](#17-standard-response-format)
18. [Error Handling](#18-error-handling)

---

## Authentication Overview

The API uses two authentication methods:

### 1. Admin Authentication (JWT)
- Use `POST /auth/admin/login` to get `accessToken` + `refreshToken`
- Send `Authorization: Bearer <accessToken>` on all admin endpoints

### 2. Mobile Device Authentication (Headers)
- Send `X-Device-ID: <unique-device-id>` on all mobile endpoints
- Send `X-User-Type: DONOR | PATIENT | BLOOD_BANK` to identify user type
- The device must be registered first (via `/donors/register`, `/patients/register`, or `/blood-banks/register`)

---

## 1. Authentication

### POST `/auth/admin/login`

Login as admin.

**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email |
| password | string | Yes | Min 6 chars |

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### POST `/auth/admin/refresh`

Refresh access token.

**Headers:** None (token in body)

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| refreshToken | string | Yes |

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### POST `/auth/admin/logout`

**Headers:** `Authorization: Bearer <accessToken>`

**Response:** `200 OK`

---

### GET `/auth/admin/me`

Get current admin profile.

**Headers:** `Authorization: Bearer <accessToken>`

**Response:**
```json
{
  "id": "uuid",
  "email": "admin@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "isSuperAdmin": false,
  "isActive": true,
  "lastLoginAt": "2025-01-01T00:00:00.000Z",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

## 2. Admin Management

> All endpoints require `Authorization: Bearer <accessToken>`

### GET `/admin/dashboard`

Get dashboard statistics.

**Response:**
```json
{
  "totalDonors": 150,
  "totalPatients": 80,
  "totalBloodBanks": 12,
  "totalDonations": 300,
  "totalBloodRequests": 95,
  "openRequests": 20,
  "pendingBloodBanks": 3
}
```

---

### GET `/admin/admins`

List all admins (paginated).

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| page | number | 1 |
| limit | number | 20 |

---

### POST `/admin/admins`

Create a new admin.

**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email |
| password | string | Yes | Min 6 chars |
| firstName | string | Yes | - |
| lastName | string | Yes | - |
| isSuperAdmin | boolean | No | Default: false |

---

### PATCH `/admin/admins/:id`

Update an admin.

**Request Body:** All fields from CreateAdminDto are optional. Additionally:
| Field | Type | Required |
|-------|------|----------|
| isActive | boolean | No |

---

### DELETE `/admin/admins/:id`

Deactivate an admin (soft delete).

---

### GET `/admin/donors`

List all donors (paginated).

**Query:** `page`, `limit`

---

### GET `/admin/patients`

List all patients (paginated).

**Query:** `page`, `limit`

---

### GET `/admin/blood-requests`

List all blood requests (paginated).

**Query:** `page`, `limit`

---

### PATCH `/admin/donors/:id/toggle-active`

Toggle a donor's active status.

---

### PATCH `/admin/patients/:id/toggle-active`

Toggle a patient's active status.

---

## 3. Donors

### POST `/donors/register`

Register a new donor or retrieve existing one by device ID.

**Headers:**
| Header | Value |
|--------|-------|
| X-Device-ID | unique-device-id |
| X-User-Type | DONOR |

**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | Yes | - |
| bloodType | BloodType | Yes | Enum (see below) |
| latitude | number | Yes | - |
| longitude | number | Yes | - |
| mobile | string | No | - |
| gender | Gender | No | MALE or FEMALE |
| dateOfBirth | string | No | ISO date string |
| lastDonationDate | string | No | ISO date string |
| fcmToken | string | No | Firebase token |

**Response:**
```json
{
  "id": "uuid",
  "deviceId": "device-123",
  "name": "Ahmed",
  "mobile": "+964...",
  "bloodType": "O_POSITIVE",
  "gender": "MALE",
  "dateOfBirth": "1990-01-01T00:00:00.000Z",
  "latitude": 33.312,
  "longitude": 44.366,
  "isAvailable": true,
  "lastDonationDate": null,
  "totalDonations": 0,
  "points": 0,
  "fcmToken": "...",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

### GET `/donors/me`

Get own profile.

**Headers:** `X-Device-ID`, `X-User-Type: DONOR`

---

### PATCH `/donors/me`

Update own profile.

**Headers:** `X-Device-ID`, `X-User-Type: DONOR`

**Request Body:** (all optional)
| Field | Type | Validation |
|-------|------|------------|
| name | string | - |
| mobile | string | - |
| bloodType | BloodType | Enum |
| gender | Gender | Enum |
| dateOfBirth | string | ISO date |
| latitude | number | - |
| longitude | number | - |
| isAvailable | boolean | - |
| lastDonationDate | string | ISO date |
| fcmToken | string | - |

---

### GET `/donors/search`

Search donors by blood type and location. **No authentication required.**

**Query Parameters:**
| Param | Type | Default | Validation |
|-------|------|---------|------------|
| bloodType | BloodType | - | Optional |
| latitude | number | - | Optional |
| longitude | number | - | Optional |
| radiusKm | number | 5 | Min: 1, Max: 50 |
| availableOnly | boolean | true | - |
| includeCompatible | boolean | false | Include compatible blood types |
| page | number | 1 | - |
| limit | number | 20 | Max: 100 |

---

### GET `/donors/me/donations`

Get own donation history (paginated).

**Headers:** `X-Device-ID`, `X-User-Type: DONOR`
**Query:** `page`, `limit`

---

### GET `/donors/me/offers`

Get own donation offers (paginated).

**Headers:** `X-Device-ID`, `X-User-Type: DONOR`
**Query:** `page`, `limit`

---

### GET `/donors/me/badges`

Get own badges.

**Headers:** `X-Device-ID`, `X-User-Type: DONOR`

**Response:**
```json
[
  {
    "id": "uuid",
    "donorId": "uuid",
    "badge": "FIRST_DONATION",
    "earnedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### GET `/donors/me/points`

Get points balance and transaction history (paginated).

**Headers:** `X-Device-ID`, `X-User-Type: DONOR`
**Query:** `page`, `limit`

---

### PATCH `/donors/me/fcm-token`

Update FCM token for push notifications.

**Headers:** `X-Device-ID`, `X-User-Type: DONOR`

**Request Body:**
```json
{
  "fcmToken": "firebase-token-string"
}
```

---

### PATCH `/donors/me/availability`

Toggle donor availability.

**Headers:** `X-Device-ID`, `X-User-Type: DONOR`

**Request Body:**
```json
{
  "isAvailable": true
}
```

---

## 4. Patients

### POST `/patients/register`

Register a new patient or retrieve existing one.

**Headers:** `X-Device-ID`, `X-User-Type: PATIENT`

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| name | string | Yes |
| mobile | string | No |
| latitude | number | No |
| longitude | number | No |
| fcmToken | string | No |

---

### GET `/patients/me`

Get own profile.

**Headers:** `X-Device-ID`, `X-User-Type: PATIENT`

---

### PATCH `/patients/me`

Update own profile.

**Headers:** `X-Device-ID`, `X-User-Type: PATIENT`

**Request Body:** (all optional)
| Field | Type |
|-------|------|
| name | string |
| mobile | string |
| latitude | number |
| longitude | number |
| fcmToken | string |

---

### GET `/patients/me/requests`

Get own blood requests (paginated).

**Headers:** `X-Device-ID`, `X-User-Type: PATIENT`
**Query:** `page`, `limit`

---

### PATCH `/patients/me/fcm-token`

Update FCM token.

**Headers:** `X-Device-ID`, `X-User-Type: PATIENT`

**Request Body:**
```json
{
  "fcmToken": "firebase-token-string"
}
```

---

## 5. Blood Banks

### POST `/blood-banks/register`

Register a new blood bank (status will be PENDING until admin approval).

**Headers:** `X-Device-ID`, `X-User-Type: BLOOD_BANK`

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| name | string | Yes |
| latitude | number | Yes |
| longitude | number | Yes |
| nameAr | string | No |
| phone | string | No |
| email | string | No |
| address | string | No |
| city | string | No |
| licenseNumber | string | No |
| fcmToken | string | No |

---

### GET `/blood-banks`

List all approved blood banks (paginated). **No authentication required.**

**Query:** `page`, `limit`

---

### GET `/blood-banks/:id`

Get blood bank details with stock levels. **No authentication required.**

---

### PATCH `/blood-banks/me`

Update own blood bank profile.

**Headers:** `X-Device-ID`, `X-User-Type: BLOOD_BANK`

**Request Body:** All fields from RegisterBloodBankDto are optional.

---

### GET `/blood-banks/me/stock`

Get own stock levels.

**Headers:** `X-Device-ID`, `X-User-Type: BLOOD_BANK`

---

### GET `/blood-banks/pending`

List pending blood bank applications. **Admin only.**

**Headers:** `Authorization: Bearer <accessToken>`

---

### PATCH `/blood-banks/:id/approve`

Approve a blood bank. **Admin only.**

**Headers:** `Authorization: Bearer <accessToken>`

---

### PATCH `/blood-banks/:id/reject`

Reject a blood bank. **Admin only.**

**Headers:** `Authorization: Bearer <accessToken>`

---

### PATCH `/blood-banks/:id/suspend`

Suspend a blood bank. **Admin only.**

**Headers:** `Authorization: Bearer <accessToken>`

---

## 6. Blood Requests

### POST `/blood-requests`

Create a new blood request.

**Headers:** `X-Device-ID`, `X-User-Type: PATIENT`

**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| bloodType | BloodType | Yes | Enum |
| bagsNeeded | number | Yes | Min: 1 |
| patientName | string | Yes | - |
| latitude | number | Yes | - |
| longitude | number | Yes | - |
| urgency | BloodRequestUrgency | No | Default: NORMAL |
| hospitalName | string | No | - |
| bloodBankId | string | No | UUID of blood bank |
| contactPhone | string | No | - |
| notes | string | No | - |

**Response:**
```json
{
  "id": "uuid",
  "patientId": "uuid",
  "bloodType": "A_POSITIVE",
  "bagsNeeded": 3,
  "bagsFulfilled": 0,
  "urgency": "URGENT",
  "status": "OPEN",
  "patientName": "Patient Name",
  "hospitalName": "Hospital",
  "latitude": 33.312,
  "longitude": 44.366,
  "contactPhone": "+964...",
  "notes": null,
  "shareToken": "uuid-share-token",
  "expiresAt": null,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

### GET `/blood-requests`

List open blood requests with filters. **No authentication required.**

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| bloodType | BloodType | - | Filter by blood type |
| status | BloodRequestStatus | OPEN | Filter by status |
| urgency | BloodRequestUrgency | - | Filter by urgency |
| latitude | number | - | For distance sorting |
| longitude | number | - | For distance sorting |
| radiusKm | number | 10 | Max distance filter |
| page | number | 1 | - |
| limit | number | 20 | Max: 100 |

---

### GET `/blood-requests/:id`

Get a single blood request with offers. **No authentication required.**

---

### GET `/blood-requests/share/:shareToken`

Get request by share token (for shared links). **No authentication required.**

---

### PATCH `/blood-requests/:id`

Update a blood request (owner only).

**Headers:** `X-Device-ID`, `X-User-Type: PATIENT`

**Request Body:** (all optional)
| Field | Type | Validation |
|-------|------|------------|
| hospitalName | string | - |
| contactPhone | string | - |
| notes | string | - |
| status | BloodRequestStatus | Enum |
| bagsFulfilled | number | Min: 0 |

---

### PATCH `/blood-requests/:id/cancel`

Cancel a blood request (owner only).

**Headers:** `X-Device-ID`, `X-User-Type: PATIENT`

---

### POST `/blood-requests/:id/notify-donors`

Find and notify compatible nearby donors for a blood request.

**Headers:** `X-Device-ID`, `X-User-Type: PATIENT`

**Response:**
```json
{
  "request": { "..." },
  "donors": [
    {
      "id": "uuid",
      "name": "Donor",
      "bloodType": "O_POSITIVE",
      "distanceKm": 2.5
    }
  ],
  "compatibleTypes": ["O_POSITIVE", "O_NEGATIVE"]
}
```

---

## 7. Donation Offers

### POST `/donation-offers`

Offer to donate for a blood request.

**Headers:** `X-Device-ID`, `X-User-Type: DONOR`

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| bloodRequestId | string | Yes |
| message | string | No |

**Response:**
```json
{
  "id": "uuid",
  "bloodRequestId": "uuid",
  "donorId": "uuid",
  "status": "PENDING",
  "message": "I can help",
  "donor": { "id": "...", "name": "...", "bloodType": "..." },
  "bloodRequest": { "id": "...", "bloodType": "...", "patientName": "..." },
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

### GET `/donation-offers/request/:requestId`

List all offers for a blood request. **No authentication required.**

---

### PATCH `/donation-offers/:id/accept`

Accept a donation offer (patient only).

**Headers:** `X-Device-ID`, `X-User-Type: PATIENT`

---

### PATCH `/donation-offers/:id/reject`

Reject a donation offer (patient only).

**Headers:** `X-Device-ID`, `X-User-Type: PATIENT`

---

### PATCH `/donation-offers/:id/complete`

Mark donation offer as completed. This automatically:
- Creates a Donation record
- Awards 100 points to the donor
- Increments `bagsFulfilled` on the blood request
- Updates request status to FULFILLED if all bags are met

**Headers:** `X-Device-ID`, `X-User-Type: DONOR` or `PATIENT`

---

### PATCH `/donation-offers/:id/cancel`

Cancel own offer (donor only).

**Headers:** `X-Device-ID`, `X-User-Type: DONOR`

---

## 8. Donations

> All endpoints require `Authorization: Bearer <accessToken>` (Admin only)

### POST `/donations`

Manually record a donation.

**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| donorId | string | Yes | UUID |
| bloodType | BloodType | Yes | Enum |
| bagsCount | number | No | Default: 1, Min: 1 |
| hospitalName | string | No | - |
| notes | string | No | - |
| donatedAt | string | No | ISO date string |

---

### GET `/donations`

List all donations (paginated).

**Query:** `page`, `limit`

---

### GET `/donations/stats`

Get donation statistics.

**Response:**
```json
{
  "totalDonations": 300,
  "totalBags": 450,
  "donationsThisMonth": 25,
  "topDonors": [...]
}
```

---

### GET `/donations/:id`

Get a single donation detail.

---

## 9. Blood Stock

### PUT `/blood-stock`

Update stock for a blood type (blood bank only).

**Headers:** `X-Device-ID`, `X-User-Type: BLOOD_BANK`

**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| bloodType | BloodType | Yes | Enum |
| bagsCount | number | Yes | Min: 0 |
| stockLevel | StockLevel | Yes | CRITICAL, LOW, ADEQUATE, HIGH |

---

### GET `/blood-stock/bank/:bankId`

Get stock levels for a blood bank. **No authentication required.**

**Response:**
```json
[
  {
    "id": "uuid",
    "bloodBankId": "uuid",
    "bloodType": "A_POSITIVE",
    "bagsCount": 15,
    "stockLevel": "ADEQUATE",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### POST `/blood-stock/shortage-alert`

Create a shortage alert (blood bank only).

**Headers:** `X-Device-ID`, `X-User-Type: BLOOD_BANK`

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| bloodType | BloodType | Yes |
| message | string | No |

---

### GET `/blood-stock/shortage-alerts`

List active shortage alerts (paginated). **No authentication required.**

**Query:** `page`, `limit`

---

### PATCH `/blood-stock/shortage-alerts/:id/resolve`

Mark a shortage alert as resolved. **No authentication required.**

---

## 10. Campaigns

### POST `/campaigns`

Create a donation campaign (blood bank only).

**Headers:** `X-Device-ID`, `X-User-Type: BLOOD_BANK`

**Request Body:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| title | string | Yes | - |
| latitude | number | Yes | - |
| longitude | number | Yes | - |
| startDate | string | Yes | ISO date string |
| endDate | string | Yes | ISO date string |
| titleAr | string | No | - |
| description | string | No | - |
| descriptionAr | string | No | - |
| address | string | No | - |
| targetBags | number | No | Integer |
| bloodTypes | BloodType[] | No | Array of BloodType enums |

---

### GET `/campaigns`

List campaigns with filters. **No authentication required.**

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| status | CampaignStatus | - |
| page | number | 1 |
| limit | number | 20 |

---

### GET `/campaigns/:id`

Get campaign detail. **No authentication required.**

---

### PATCH `/campaigns/:id`

Update a campaign (owner blood bank only).

**Headers:** `X-Device-ID`, `X-User-Type: BLOOD_BANK`

**Request Body:** All fields from CreateCampaignDto are optional. Additionally:
| Field | Type |
|-------|------|
| status | CampaignStatus |

---

### PATCH `/campaigns/:id/cancel`

Cancel a campaign (owner blood bank only).

**Headers:** `X-Device-ID`, `X-User-Type: BLOOD_BANK`

---

### POST `/campaigns/:id/register`

Register for a campaign (donor only).

**Headers:** `X-Device-ID`, `X-User-Type: DONOR`

---

### DELETE `/campaigns/:id/register`

Unregister from a campaign (donor only).

**Headers:** `X-Device-ID`, `X-User-Type: DONOR`

---

### PATCH `/campaigns/:id/attendance/:donorId`

Mark donor attendance at campaign (blood bank only).

**Headers:** `X-Device-ID`, `X-User-Type: BLOOD_BANK`

---

## 11. Notifications

### GET `/notifications`

Get own notifications (paginated).

**Headers:** `X-Device-ID`, `X-User-Type: DONOR | PATIENT`

**Query Parameters:**
| Param | Type | Default |
|-------|------|---------|
| userType | string | - |
| page | number | 1 |
| limit | number | 20 |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "BLOOD_REQUEST",
      "title": "New blood request nearby",
      "titleAr": "...",
      "body": "A patient needs O+ blood",
      "bodyAr": "...",
      "data": { "requestId": "uuid" },
      "isRead": false,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### GET `/notifications/unread-count`

Get unread notification count.

**Headers:** `X-Device-ID`, `X-User-Type: DONOR | PATIENT`

**Query:** `userType=DONOR` or `userType=PATIENT`

**Response:**
```json
{
  "count": 5
}
```

---

### PATCH `/notifications/:id/read`

Mark a single notification as read.

**Headers:** `X-Device-ID`, `X-User-Type: DONOR | PATIENT`

---

### PATCH `/notifications/read-all`

Mark all notifications as read.

**Headers:** `X-Device-ID`, `X-User-Type: DONOR | PATIENT`

**Query:** `userType=DONOR` or `userType=PATIENT`

---

### POST `/notifications/broadcast`

Send a broadcast notification to all users. **Admin only.**

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**
| Field | Type | Required |
|-------|------|----------|
| title | string | Yes |
| body | string | Yes |
| titleAr | string | No |
| bodyAr | string | No |

This sends both a WebSocket event and an FCM push notification to all users.

---

## 12. Chat

### POST `/chat/rooms`

Create or get a chat room for a blood request.

**Headers:** `X-Device-ID`, `X-User-Type: DONOR | PATIENT`

**Request Body:**
```json
{
  "bloodRequestId": "uuid"
}
```

---

### GET `/chat/rooms`

List own chat rooms.

**Headers:** `X-Device-ID`, `X-User-Type: DONOR | PATIENT`

---

### GET `/chat/rooms/:id/messages`

Get chat room messages (paginated).

**Headers:** `X-Device-ID`, `X-User-Type: DONOR | PATIENT`

**Query:** `page`, `limit`

---

## 13. Gamification

All endpoints are **public** (no authentication required).

### GET `/gamification/leaderboard`

Get top donors by points.

**Query:** `page`, `limit`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Top Donor",
      "bloodType": "O_POSITIVE",
      "totalDonations": 25,
      "points": 2500
    }
  ],
  "meta": { "total": 100, "page": 1, "limit": 20, "totalPages": 5 }
}
```

---

### GET `/gamification/badges`

List all available badges with descriptions.

**Response:**
```json
[
  {
    "badge": "FIRST_DONATION",
    "name": "First Donation",
    "description": "Complete your first donation",
    "requirement": 1
  },
  {
    "badge": "FIVE_DONATIONS",
    "name": "Five Donations",
    "description": "Complete 5 donations",
    "requirement": 5
  }
]
```

---

### GET `/gamification/donor/:donorId/summary`

Get a donor's gamification summary.

**Response:**
```json
{
  "points": 500,
  "totalDonations": 5,
  "badges": [
    { "badge": "FIRST_DONATION", "earnedAt": "2025-01-01T00:00:00.000Z" },
    { "badge": "FIVE_DONATIONS", "earnedAt": "2025-06-01T00:00:00.000Z" }
  ],
  "nextBadge": {
    "badge": "TEN_DONATIONS",
    "remaining": 5
  }
}
```

---

## 14. Share

### POST `/share/blood-request/:id`

Generate a shareable link for a blood request.

**Headers:** `X-Device-ID`, `X-User-Type: PATIENT`

**Response:**
```json
{
  "shareToken": "uuid-token",
  "shareUrl": "https://sharyan.app/share/uuid-token"
}
```

---

### GET `/share/:token`

Resolve a share token to get the blood request data. **No authentication required.**

---

## 15. WebSocket Events

### Notification WebSocket

**URL:** `ws://localhost:3000/notifications`

**Connection Auth:**
```javascript
const socket = io('/notifications', {
  auth: {
    deviceId: 'your-device-id',
    userType: 'DONOR' // or 'PATIENT'
  }
});
```

**Events (Server -> Client):**
| Event | Description | Payload |
|-------|-------------|---------|
| `notification` | New notification | `{ type, title, body, titleAr, bodyAr, data }` |

**Events (Client -> Server):**
| Event | Description | Payload |
|-------|-------------|---------|
| `markNotificationRead` | Mark as read | `{ notificationId: string }` |

---

### Chat WebSocket

**URL:** `ws://localhost:3000/chat`

**Connection Auth:**
```javascript
const socket = io('/chat', {
  auth: {
    deviceId: 'your-device-id',
    userType: 'DONOR' // or 'PATIENT'
  }
});
```

**Events (Client -> Server):**
| Event | Payload |
|-------|---------|
| `message` | `{ roomId: string, content: string, type?: 'TEXT' }` |
| `typing` | `{ roomId: string }` |

**Events (Server -> Client):**
| Event | Description |
|-------|-------------|
| `message` | New message in room |
| `typing` | User is typing |
| `userJoined` | User joined room |
| `userLeft` | User left room |

---

## 16. Enums Reference

### BloodType
```
A_POSITIVE, A_NEGATIVE, B_POSITIVE, B_NEGATIVE,
AB_POSITIVE, AB_NEGATIVE, O_POSITIVE, O_NEGATIVE
```

### Gender
```
MALE, FEMALE
```

### BloodRequestStatus
```
OPEN, PARTIALLY_FULFILLED, FULFILLED, CANCELLED, EXPIRED
```

### BloodRequestUrgency
```
NORMAL, URGENT, EMERGENCY
```

### BloodBankStatus
```
PENDING, APPROVED, REJECTED, SUSPENDED
```

### DonationOfferStatus
```
PENDING, ACCEPTED, REJECTED, COMPLETED, CANCELLED, NO_SHOW
```

### CampaignStatus
```
UPCOMING, ACTIVE, COMPLETED, CANCELLED
```

### NotificationType
```
BLOOD_REQUEST, EMERGENCY_REQUEST, DONATION_REMINDER,
CAMPAIGN_ANNOUNCEMENT, SHORTAGE_ALERT, DONATION_OFFER,
CHAT_MESSAGE, BADGE_EARNED, POINTS_EARNED, SYSTEM
```

### StockLevel
```
CRITICAL, LOW, ADEQUATE, HIGH
```

### BadgeType
```
FIRST_DONATION, FIVE_DONATIONS, TEN_DONATIONS,
TWENTY_FIVE_DONATIONS, FIFTY_DONATIONS, LIFE_SAVER,
SPEED_HERO, CONSISTENT_DONOR, CAMPAIGN_CHAMPION, COMMUNITY_PILLAR
```

### ChatMessageType
```
TEXT, IMAGE, LOCATION, SYSTEM
```

### UserRole
```
ADMIN, DONOR, PATIENT, BLOOD_BANK
```

---

## 17. Standard Response Format

All responses are wrapped in a standard format by the `TransformInterceptor`:

**Success (single item):**
```json
{
  "statusCode": 200,
  "data": { ... },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

**Success (paginated list):**
```json
{
  "statusCode": 200,
  "data": {
    "data": [ ... ],
    "meta": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "totalPages": 5
    }
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

## 18. Error Handling

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

**Common HTTP Status Codes:**
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid auth) |
| 403 | Forbidden (not your resource) |
| 404 | Not Found |
| 409 | Conflict (duplicate, invalid state) |
| 500 | Internal Server Error |

**Prisma-specific errors** (e.g., unique constraint violations) are automatically caught and returned as `409 Conflict`.

---

## Quick Start Guide

### 1. Register a Donor
```bash
curl -X POST http://localhost:3000/api/v1/donors/register \
  -H "Content-Type: application/json" \
  -H "X-Device-ID: my-device-123" \
  -H "X-User-Type: DONOR" \
  -d '{
    "name": "Ahmed",
    "bloodType": "O_POSITIVE",
    "latitude": 33.312,
    "longitude": 44.366,
    "fcmToken": "firebase-token-here"
  }'
```

### 2. Register a Patient
```bash
curl -X POST http://localhost:3000/api/v1/patients/register \
  -H "Content-Type: application/json" \
  -H "X-Device-ID: patient-device-456" \
  -H "X-User-Type: PATIENT" \
  -d '{
    "name": "Sara",
    "mobile": "+9641234567",
    "fcmToken": "firebase-token-here"
  }'
```

### 3. Create a Blood Request
```bash
curl -X POST http://localhost:3000/api/v1/blood-requests \
  -H "Content-Type: application/json" \
  -H "X-Device-ID: patient-device-456" \
  -H "X-User-Type: PATIENT" \
  -d '{
    "bloodType": "O_POSITIVE",
    "bagsNeeded": 2,
    "urgency": "URGENT",
    "patientName": "Sara",
    "hospitalName": "Baghdad Hospital",
    "latitude": 33.312,
    "longitude": 44.366,
    "contactPhone": "+9641234567"
  }'
```

### 4. Offer to Donate
```bash
curl -X POST http://localhost:3000/api/v1/donation-offers \
  -H "Content-Type: application/json" \
  -H "X-Device-ID: my-device-123" \
  -H "X-User-Type: DONOR" \
  -d '{
    "bloodRequestId": "request-uuid-here",
    "message": "I can donate today"
  }'
```

### 5. Admin Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sharyan.app",
    "password": "password123"
  }'
```
