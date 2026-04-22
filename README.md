<h1 align="center">Sharyan — شريان</h1>
<p align="center"><b>A real-time blood donation platform backend.</b><br/>
Connecting donors, patients, and blood banks through geo-matching, gamification, and live emergency alerts.</p>

<p align="center">
  <img alt="NestJS" src="https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white" />
  <img alt="Socket.io" src="https://img.shields.io/badge/Socket.io-4-010101?logo=socket.io&logoColor=white" />
  <img alt="Firebase" src="https://img.shields.io/badge/Firebase%20Admin-FCM-FFCA28?logo=firebase&logoColor=black" />
</p>

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Feature Catalogue](#feature-catalogue)
5. [Domain Model](#domain-model)
6. [Design Patterns & SOLID](#design-patterns--solid)
7. [API Surface](#api-surface)
8. [Security](#security)
9. [Getting Started](#getting-started)
10. [Project Structure](#project-structure)
11. [CV Blurb](#cv-blurb)

---

## Overview

**Sharyan** (Arabic for *artery*) is a production-grade backend for a blood-donation platform. It matches blood requests from **patients** with the nearest compatible **donors**, routes inventory through approved **blood banks**, and coordinates community **campaigns** — all with real-time chat, push notifications, and a gamified donor reputation system.

The backend serves four user types:

| Role           | How they authenticate            | What they do                                                             |
| -------------- | -------------------------------- | ------------------------------------------------------------------------ |
| **Admin**      | Email + password → JWT + refresh | Dashboard, approve blood banks, verify donations, manage users           |
| **Donor**      | Device-ID + user-type headers    | Register, offer blood for requests, earn points/badges, chat, join drives |
| **Patient**    | Device-ID + user-type headers    | Post blood requests (normal / urgent / emergency), accept offers, chat   |
| **Blood Bank** | Device-ID + user-type headers    | Register, manage stock, raise shortage alerts, run campaigns             |

---

## Tech Stack

| Layer               | Technology                                       |
| ------------------- | ------------------------------------------------ |
| **Framework**       | NestJS 11 (TypeScript, decorator-driven DI)      |
| **Database**        | PostgreSQL                                       |
| **ORM**             | Prisma 5 (type-safe queries, migrations, seed)   |
| **Auth**            | Passport + `@nestjs/jwt` (access + refresh)      |
| **Password Hashing**| bcrypt                                           |
| **Real-time**       | Socket.io via `@nestjs/websockets`               |
| **Push**            | `firebase-admin` (FCM)                           |
| **Validation**      | `class-validator` + `class-transformer`          |
| **API Docs**        | Swagger / OpenAPI (`@nestjs/swagger`)            |
| **Testing**         | Jest + `@nestjs/testing` + supertest             |
| **Tooling**         | ESLint, Prettier, `ts-node`                      |

---

## System Architecture

Sharyan follows a **layered, modular, dependency-injected** architecture built on NestJS conventions.

```
                ┌──────────────────────────────────────────────────┐
                │                HTTP / WebSocket Client            │
                │   (Mobile apps, admin dashboard, shared links)    │
                └──────────────┬───────────────────────┬────────────┘
                               │ REST (/api/v1)        │ WS (/chat)
                               ▼                       ▼
            ┌──────────────────────────────────────────────────────┐
            │ Global Pipeline: ValidationPipe → Guards →           │
            │   Controllers/Gateways → Interceptor → ExceptionFilter│
            └──────────────────────────────────────────────────────┘
                               │
                               ▼
            ┌──────────────────────────────────────────────────────┐
            │                 FEATURE MODULES (18)                 │
            │  auth, admin, donor, patient, blood-bank,            │
            │  blood-request, blood-compatibility, blood-stock,    │
            │  donation, donation-offer, campaign, chat,           │
            │  notification, gamification, geo, share, sms,        │
            │  firebase                                             │
            └──────────────────────────────────────────────────────┘
                               │
                               ▼
            ┌──────────────────────────────────────────────────────┐
            │  Shared Services: PrismaService · FirebaseService ·  │
            │  GeoService · BloodCompatibilityService · SmsService │
            └──────────────────────────────────────────────────────┘
                               │
                               ▼
                    ┌───────────────────────┐
                    │  PostgreSQL (Prisma)  │
                    └───────────────────────┘
```

### Request lifecycle

1. **Global `ValidationPipe`** — whitelists DTO fields, strips unknown input, transforms primitives.
2. **Guards** — `AdminJwtAuthGuard` for admin routes, `DeviceAuthGuard` for mobile users.
3. **Controllers / Gateways** — thin HTTP/WS handlers, delegate to services.
4. **Services** — all business logic + Prisma calls; compose shared services (Geo, Compatibility, Firebase).
5. **`TransformInterceptor`** — wraps every response in a consistent envelope.
6. **`AllExceptionsFilter` + `PrismaExceptionFilter`** — normalize errors (P2002 → 409, P2025 → 404, P2003 → 400).

---

## Feature Catalogue

### 🔐 Authentication ([src/auth/](src/auth/))
- Admin login with **JWT access token (15 m) + refresh token (7 d)**.
- **Refresh-token rotation** — refresh tokens are bcrypt-hashed before being stored in the DB.
- Endpoints: `POST /auth/admin/login · /refresh · /logout`, `GET /auth/admin/me`.
- Passport strategies: [jwt.strategy.ts](src/auth/strategies/jwt.strategy.ts), [jwt-refresh.strategy.ts](src/auth/strategies/jwt-refresh.strategy.ts).

### 🛠 Admin Panel ([src/admin/](src/admin/))
- Platform dashboard aggregating donors, patients, banks, open & emergency requests, donations, campaigns.
- CRUD over admins (with `isSuperAdmin` flag and soft-deactivation).
- Paginated user lists and blood requests; activation toggles for donors and patients.

### 🩸 Donors ([src/donor/](src/donor/))
- Idempotent **device-based registration** (`registerOrGet`).
- Profile + blood type + geo-location (lat/lng) + availability flag + FCM token.
- **Geo-proximity search** with Haversine distance + compatible-blood-type filter.
- Personal history: donations, offers, badges, point-transaction ledger.

### 🧑 Patients ([src/patient/](src/patient/))
- Device-based registration, profile updates, FCM token.
- Paginated personal blood-request list.

### 🏥 Blood Banks ([src/blood-bank/](src/blood-bank/))
- **Approval workflow:** `PENDING → APPROVED / REJECTED / SUSPENDED` with admin audit trail (approver id + timestamp).
- Public listing only surfaces approved banks.
- Bank detail aggregates stock, active campaigns, and unresolved shortage alerts.

### 🆘 Blood Requests ([src/blood-request/](src/blood-request/))
- Patients create requests with **urgency (NORMAL / URGENT / EMERGENCY)** and target bag count.
- Geo-radius search with urgency-aware radius expansion (5 km → 10 km → 25 km fallback for emergencies).
- Auto-generated **UUID share token** for viral sharing (WhatsApp / Telegram / direct link).
- Public `/share/:token` endpoint — no auth required.
- Status machine: `OPEN → PARTIALLY_FULFILLED → FULFILLED / CANCELLED / EXPIRED`.

### 🤝 Donation Offers ([src/donation-offer/](src/donation-offer/))
- Donor → request offer with uniqueness constraint (one offer per donor per request).
- Status machine: `PENDING → ACCEPTED → COMPLETED` (or `REJECTED / CANCELLED / NO_SHOW`).
- **Completion runs inside a `prisma.$transaction`** that atomically:
  1. Marks the offer `COMPLETED`.
  2. Creates a `Donation` record (100 points).
  3. Increments donor `totalDonations`, `points`, sets `lastDonationDate`.
  4. Increments request `bagsFulfilled` → flips status to `FULFILLED` when target is met.
  5. Writes a `PointTransaction` audit row.

### 🧪 Donations ([src/donation/](src/donation/))
- Admin-side manual record (for offline blood drives) with verifier audit trail.
- Stats endpoint: totals, last 30 days, grouped by blood type.

### 🔬 Blood Compatibility ([src/blood-compatibility/](src/blood-compatibility/))
- Stateless service with the canonical 8×8 compatibility matrix.
- `getCompatibleDonorTypes`, `getCompatibleRecipientTypes`, `isCompatible`.
- Used by request matching to find medically-eligible donors.

### 📍 Geo ([src/geo/](src/geo/))
- Haversine distance calculation (Earth radius 6371 km).
- `findNearbyDonors` enforces the **56-day minimum inter-donation interval** for donor safety.
- `findNearbyBloodBanks` filters approved banks by radius.

### 📦 Blood Stock ([src/blood-stock/](src/blood-stock/))
- Per-bank × per-blood-type inventory (`bagsCount`, level: CRITICAL / LOW / ADEQUATE / HIGH).
- `ShortageAlert` records with resolver audit trail.

### 🎯 Campaigns ([src/campaign/](src/campaign/))
- Blood banks schedule drives with target and collected-bag counters.
- Full **bilingual fields** (title / titleAr, description / descriptionAr).
- Donor self-registration + attendance tracking on drive day.
- Status machine: `UPCOMING → ACTIVE → COMPLETED / CANCELLED`.

### 🏆 Gamification ([src/gamification/](src/gamification/))
- **10 badge types**: FIRST / FIVE / TEN / TWENTY_FIVE / FIFTY donations, LIFE_SAVER (emergency response), SPEED_HERO (<30 min response), CONSISTENT_DONOR, CAMPAIGN_CHAMPION, COMMUNITY_PILLAR.
- `checkAndAwardBadges(donorId)` triggered after each donation.
- Leaderboard + per-donor summary with computed rank.
- Immutable audit via `PointTransaction`.

### 💬 Chat ([src/chat/](src/chat/))
- REST for rooms & history + Socket.io gateway for real-time events.
- Rooms are scoped to a `(bloodRequest, donor, patient)` tuple and created idempotently.
- Events: `joinRoom`, `leaveRoom`, `sendMessage`, `typing`, `markRead` → broadcast `newMessage`, `userTyping`, `messagesRead`.
- WebSocket handshake authenticates via `{ deviceId, userType }` and persists `userId / userType / userName` on the socket.

### 🔔 Notifications ([src/notification/](src/notification/))
- Persisted notifications + FCM delivery (single, multicast, or topic broadcast).
- **Bilingual** payload (`title/titleAr`, `body/bodyAr`).
- 10 notification types covering requests, emergencies, reminders, campaigns, shortages, chats, badges, points, system.
- Resilient to invalid FCM tokens (logged, not thrown).

### 🔥 Firebase ([src/firebase/](src/firebase/))
- Lazy-initialised admin SDK wrapper.
- **Graceful degradation:** if credentials are missing, logs a warning and disables push — the rest of the API keeps working.

### 📱 SMS ([src/sms/](src/sms/))
- Provider-agnostic facade (mock logger today, swappable for Twilio/AWS SNS).
- Every send persists an `SmsLog` row for auditability.
- Pre-built emergency template for critical blood requests.

### 🔗 Share ([src/share/](src/share/))
- One-click share links for blood requests.
- Returns three variants: direct URL, pre-filled WhatsApp intent, pre-filled Telegram intent.

### 🧱 Cross-cutting — `common/` ([src/common/](src/common/))
- Guards: `AdminJwtAuthGuard`, `DeviceAuthGuard`, `RolesGuard`.
- Decorators: `@CurrentAdmin`, `@CurrentDevice`, `@AllowUnregistered`, `@Roles`.
- `TransformInterceptor` — uniform `{ data, statusCode, timestamp }` envelope.
- `AllExceptionsFilter` + `PrismaExceptionFilter` — sanitised error responses.
- `PaginationQueryDto` + `paginate()` helper for consistent pagination.

---

## Domain Model

PostgreSQL schema defined in [prisma/schema.prisma](prisma/schema.prisma) — **22 models, 9 enums**.

| Model | Role |
| ----- | ---- |
| `Admin` | Privileged user with password + refresh-token hash |
| `Donor` | Blood donor profile (blood type, geo, points, availability, FCM) |
| `Patient` | Requester profile (geo, FCM) |
| `BloodBank` | Approved institution (stock, campaigns) |
| `BloodRequest` | Blood need with urgency + share token |
| `DonationOffer` | Donor's response to a request |
| `Donation` | Completed donation (points awarded, verifier admin) |
| `BloodStock` | Inventory per (bank, blood type) |
| `ShortageAlert` | Bank-raised shortage flag |
| `Campaign` / `CampaignRegistration` | Drives + attendance |
| `DonorBadge` / `PointTransaction` | Gamification ledger |
| `Notification` | Bilingual notification record |
| `ChatRoom` / `ChatParticipant` / `ChatMessage` | Messaging |
| `SmsLog` | SMS audit log |
| `AppSetting` | Key/value config store |

**Blood types:** `A_POSITIVE, A_NEGATIVE, B_POSITIVE, B_NEGATIVE, AB_POSITIVE, AB_NEGATIVE, O_POSITIVE, O_NEGATIVE`.

---

## Design Patterns & SOLID

This project was deliberately built with textbook patterns and SOLID principles. The highlights:

### SOLID

- **S — Single Responsibility.** Each feature is a self-contained NestJS module (controller + service + DTOs + guards). Services don't reach into one another's data; they call each other's methods.
- **O — Open/Closed.** The `SmsService` facade ships with a mock implementation but exposes the same interface a Twilio/AWS SNS adapter would — no caller changes needed. Notification delivery is similarly pluggable.
- **L — Liskov Substitution.** All guards honour the `CanActivate` contract; any strategy can be swapped at the module level without touching controllers.
- **I — Interface Segregation.** DTOs are route-specific and minimal (`RegisterDonorDto`, `UpdateDonorDto`, `CreateBloodRequestDto`, …) rather than one giant write model.
- **D — Dependency Inversion.** Controllers and services depend on **injected abstractions** (`PrismaService`, `FirebaseService`, `GeoService`, `BloodCompatibilityService`) rather than constructing them. This is what makes every unit testable with `@nestjs/testing`.

### Patterns in use

| Pattern | Where |
| ------- | ----- |
| **Layered architecture** | Controller → Service → Prisma, never skipped |
| **Dependency Injection** | NestJS module providers |
| **Repository (via Prisma)** | Services own all `prisma.{model}.{op}()` calls |
| **DTO / Validation** | `class-validator` decorators + global `ValidationPipe` |
| **Guard + Decorator** | Auth / role enforcement without leaking into handlers |
| **Interceptor** | `TransformInterceptor` shapes every response |
| **Exception Filter** | Prisma + generic filters translate errors to HTTP |
| **Strategy** | Passport auth strategies; SMS provider abstraction |
| **Observer (pub/sub)** | Socket.io rooms broadcasting chat + typing + read events |
| **Facade** | `FirebaseService` hides the admin SDK from callers |
| **Value Object** | `BloodCompatibilityService` exposes immutable lookup tables |
| **Unit of Work / Transaction** | `prisma.$transaction` in `DonationOfferService.complete()` guarantees atomic fulfilment |
| **Factory** | `AuthService.generateTokens()` encapsulates token pair creation + hashing |
| **State Machine** | Request, offer, campaign, and blood-bank statuses are explicit finite enums |

---

## API Surface

- **Base URL:** `http://localhost:3000/api/v1`
- **Interactive docs:** `http://localhost:3000/docs` (Swagger UI with `Bearer`, `X-Device-ID`, and `X-User-Type` auth schemes registered).
- **WebSocket:** Socket.io namespace `/chat`, handshake auth `{ deviceId, userType }`.

Representative endpoints:

| Area | Method | Path |
| ---- | ------ | ---- |
| Auth | `POST` | `/auth/admin/login` · `/refresh` · `/logout` |
| Admin | `GET` | `/admin/dashboard` |
| Donor | `POST/GET/PATCH` | `/donors/register` · `/donors/me` · `/donors/search` |
| Patient | `POST/GET/PATCH` | `/patients/register` · `/patients/me` · `/patients/me/requests` |
| Blood Bank | `POST/PATCH` | `/blood-banks/register` · `/:id/approve` · `/:id/reject` |
| Request | `POST/GET` | `/blood-requests` · `/blood-requests/share/:token` |
| Offer | `PATCH` | `/donation-offers/:id/accept` · `/reject` · `/complete` |
| Stock | `PUT/POST` | `/blood-stock` · `/blood-stock/shortage-alert` |
| Campaign | `POST` | `/campaigns` · `/campaigns/:id/register` |
| Gamification | `GET` | `/gamification/leaderboard` · `/badges` |
| Share | `GET` | `/share/:token` |

---

## Security

- Passwords and refresh tokens hashed with **bcrypt**.
- Short-lived access tokens (15 m) + rotated refresh tokens (7 d).
- CORS allow-list via `CORS_ORIGINS`.
- Global `ValidationPipe` with `whitelist` + `forbidNonWhitelisted` prevents mass-assignment.
- Prisma error filter returns sanitised messages — no SQL leakage on unique / FK violations.
- Ownership checks at the service layer (e.g., a patient can only mutate their own request).
- Database-level uniqueness (email, deviceId, `bloodRequestId + donorId`) as the last line of defence.

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 13
- (Optional) Firebase service-account credentials for push notifications

### Environment

Create a `.env` at the project root:

```env
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/sharyan

JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

CORS_ORIGINS=http://localhost:3000,https://sharyan.app

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

### Install, migrate, seed, run

```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

### Scripts

```bash
npm run start          # node dist
npm run start:dev      # watch mode
npm run start:prod     # production
npm run build
npm run test           # unit
npm run test:e2e       # end-to-end
npm run test:cov       # coverage
npm run lint
npm run format
```

---

## Project Structure

```
src/
├── main.ts                 # bootstrap: pipes, filters, CORS, Swagger
├── app.module.ts           # wires 18 feature modules
├── auth/                   # admin JWT + refresh
├── admin/                  # dashboard, user mgmt
├── donor/                  # donor profile, search, history
├── patient/                # patient profile, requests
├── blood-bank/             # institution approval + stock exposure
├── blood-request/          # request CRUD + geo matching
├── blood-compatibility/    # ABO / Rh compatibility rules
├── blood-stock/            # inventory + shortage alerts
├── donation/               # admin-recorded donations + stats
├── donation-offer/         # donor → request offer workflow
├── campaign/               # blood drives + registration
├── chat/                   # REST + Socket.io gateway
├── notification/           # bilingual notifications + FCM
├── firebase/               # firebase-admin facade
├── sms/                    # SMS facade + audit log
├── gamification/           # points, 10 badges, leaderboard
├── geo/                    # Haversine + proximity queries
├── share/                  # share-token links
├── prisma/                 # PrismaService (global)
└── common/                 # guards, decorators, filters, interceptors, DTOs
prisma/
├── schema.prisma           # 22 models, 9 enums
├── migrations/
└── seed.ts                 # demo admins, donors, patients, banks, requests
```



<p align="center">Built with NestJS, Prisma, and ❤️ for saving lives.</p>
