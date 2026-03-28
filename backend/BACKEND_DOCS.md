# Emperor FX — Secure Backend Infrastructure

> **Status:** ✅ Core backend built. Ready to configure & run.

---

## 🏗️ Architecture

```
React Frontend (Vite + Zustand)
        │
        ▼
Express API  ──→  PostgreSQL (13 tables)
   Port 5000  ──→  Redis (cache + rate limit)
        │  ──→  Email (Nodemailer SMTP)
        │
        ├── WebSocket /ws (real-time)
        ├── [Future] Binance Broker API
        └── [Future] Fireblocks Custody
```

---

## 📦 What Was Built

### Backend: `/backend/src`

| Module | Files | Purpose |
|--------|-------|---------|
| **Server** | `server.js` | Express + Helmet + CORS + compression |
| **Database** | `database/connection.js`, `migrate.js` | PG pool + 13-table migration |
| **Cache** | `cache/redis.js` | Redis with in-memory fallback |
| **Auth** | `controllers/auth.controller.js` | Register, login, JWT, 2FA |
| **Wallet** | `controllers/wallet.controller.js` | Demo and live wallets, deposit/withdraw |
| **Trade** | `controllers/trade.controller.js` | Orders, positions, execution |
| **Admin** | `controllers/admin.controller.js` | User mgmt, withdrawals, audit |
| **WebSocket** | `websocket/wsServer.js` | Real-time price and order feeds |
| **Middleware** | `middleware/*.js` | Auth, rate limit, validation, errors |
| **Utils** | `utils/jwt.js`, `email.js`, `audit.js` | JWT, emails, audit trail |
| **Config** | `Dockerfile`, `docker-compose.yml` | Container-ready |

### Frontend Updated

`src/services/api.js` - Full API client with automatic JWT refresh token rotation, organized modules for auth/user/wallet/trade/market/admin.

---

## Database Schema (13 Tables)

| Table | Purpose |
|-------|---------|
| users | Core user accounts with roles and KYC status |
| sessions | Refresh token storage with device tracking |
| wallets | Demo + live wallets per user |
| transactions | Every financial event |
| orders | Trade orders (market/limit/stop) |
| trades | Executed trade fills |
| positions | Open holdings with weighted avg price |
| deposits | Incoming deposits + blockchain confirmations |
| withdrawals | Withdrawal requests + admin approval |
| audit_logs | Full security audit trail |
| kyc_documents | Identity document storage |
| notifications | In-app notifications |

Key patterns:
- locked_balance on wallets prevents double-spend during withdrawals
- Atomic DB transactions (BEGIN/COMMIT/ROLLBACK) for all fund movements
- Auto-updated updated_at via PostgreSQL triggers on every table
- Performance indices on all FK and status columns

---

## Security Features

| Feature | Detail |
|---------|--------|
| Password hashing | bcryptjs, 12 salt rounds |
| Access tokens | JWT, 15-min expiry |
| Refresh tokens | JWT, 7-day, rotated on every use |
| Token confusion prevention | type claim in JWT payload |
| Timing-safe login | bcrypt always compared even for unknown emails |
| Rate limiting | Global 100/15min, Auth 10/15min, Trade 60/min, Withdrawal 5/hr |
| Input validation | express-validator on every mutating endpoint |
| SQL injection prevention | 100% parameterized queries |
| XSS/clickjacking | Helmet.js with Content Security Policy |
| CORS | Allowlist-based with credentials |
| Session invalidation | On ban, password change, and explicit logout |
| 2FA | TOTP via speakeasy (Google Authenticator compatible) |
| Role system | user / admin / superadmin hierarchy |
| Audit trail | Every sensitive action logged to audit_logs |

---

## API Reference

Base URL: http://localhost:5000/api/v1

### Auth (public, rate limited)
- POST /auth/register - Register + auto-login
- POST /auth/login - Login, returns JWT pair
- POST /auth/refresh - Rotate refresh token
- POST /auth/logout - Invalidate session
- GET /auth/verify-email/:t - Email verification
- POST /auth/2fa/setup (auth) - Get TOTP QR code
- POST /auth/2fa/confirm (auth) - Activate 2FA

### Wallet (auth required)
- GET /wallet - All wallets (demo + live)
- GET /wallet/balance/:type - Balance for demo or live
- GET /wallet/transactions - History (paginated)
- POST /wallet/deposit - Initiate, returns provider redirect URL
- POST /wallet/deposit/confirm - Webhook from payment provider
- POST /wallet/withdraw - Request withdrawal (rate-limited 5/hr)

### Trade (auth required)
- POST /trade/order - Place market or limit order
- GET /trade/orders - Order list (filterable)
- GET /trade/positions - Open positions
- GET /trade/history - Executed trades
- DELETE /trade/order/:id - Cancel open limit order

### Market (public, Redis cached)
- GET /market/prices - Top 20 coins (30s cache)
- GET /market/coin/:id - Coin detail (60s cache)

### Admin (admin role required)
- GET /admin/stats - Dashboard stats (60s cache)
- GET /admin/users - All users (search + paginate)
- GET /admin/users/:id - User detail + wallets + trade stats
- PATCH /admin/users/:id/ban - Ban/unban + kill all sessions
- PATCH /admin/users/:id/balance - Credit or debit any wallet
- GET /admin/withdrawals/pending - Pending withdrawal queue
- PATCH /admin/withdrawals/:id - Approve or reject withdrawal
- GET /admin/audit-logs - Full audit trail (filterable)

### WebSocket: ws://localhost:5000/ws?token=ACCESS_TOKEN
- CONNECTED - On successful connection
- PRICE_UPDATE - Market price broadcast to all clients
- ORDER_UPDATE - Your order status changed (per user)
- PING/PONG - Heartbeat every 30s

---

## Step-by-Step Setup

### 1. Install PostgreSQL
Download: https://www.postgresql.org/download/windows/
Create database: CREATE DATABASE emperor_fx;

### 2. Configure Environment
```
cd backend
copy .env.example .env
# Edit .env with your values
```

Critical values to set:
- DB_PASSWORD - your PostgreSQL password
- JWT_ACCESS_SECRET - generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
- JWT_REFRESH_SECRET - different 64-byte hex string
- ADMIN_SECRET_KEY - strong secret
- SMTP_HOST, SMTP_USER, SMTP_PASS - email credentials

### 3. Run Migration
```
cd backend
node src/database/migrate.js
```

### 4. Start Backend
```
npm run dev    # development with hot-reload
npm start      # production
```

### 5. Connect Frontend
In project root .env.local:
```
VITE_API_URL=http://localhost:5000/api/v1
```

### 6. Start Frontend
```
npm run dev   # from project root
```

---

## Docker (Full Stack)

```
cd backend
docker-compose up -d
docker exec emperor_fx_api node src/database/migrate.js
```

Services: API on 5000, PostgreSQL 16 on 5432, Redis 7 on 6379

---

## Phase 2 Roadmap

| Feature | Provider | Notes |
|---------|----------|-------|
| Real deposits | MoonPay / Transak | Sandbox free to test |
| Crypto custody | Fireblocks / BitGo | Apply for institutional account |
| Live exchange | Binance Broker API | Apply for Broker program |
| KYC verification | Sumsub / Onfido | Get API key |
| Email delivery | SendGrid / Mailgun | Recommended for production |

Recommended first step: Get a MoonPay sandbox key - free, no real money, full deposit flow for testing.
