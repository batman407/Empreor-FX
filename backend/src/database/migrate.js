import { query } from './connection.js'
import { logger } from '../utils/logger.js'

/**
 * Emperor FX - Complete Database Migration
 * Run with: node src/database/migrate.js
 */

const migrations = [
  // ─── EXTENSIONS ──────────────────────────────────────────────────────────
  {
    name: 'Enable UUID Extension',
    sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
  },
  {
    name: 'Enable pgcrypto',
    sql: `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`,
  },

  // ─── USERS TABLE ─────────────────────────────────────────────────────────
  {
    name: 'Create users table',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email           VARCHAR(255) UNIQUE NOT NULL,
        username        VARCHAR(50) UNIQUE NOT NULL,
        password_hash   TEXT NOT NULL,
        first_name      VARCHAR(100) NOT NULL,
        last_name       VARCHAR(100) NOT NULL,
        phone           VARCHAR(20),
        country         VARCHAR(100),
        role            VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
        is_email_verified BOOLEAN DEFAULT FALSE,
        verification_token TEXT,
        verification_expires TIMESTAMPTZ,
        is_2fa_enabled  BOOLEAN DEFAULT FALSE,
        totp_secret     TEXT,
        kyc_status      VARCHAR(20) DEFAULT 'none' CHECK (kyc_status IN ('none', 'pending', 'approved', 'rejected')),
        kyc_submitted_at TIMESTAMPTZ,
        is_active       BOOLEAN DEFAULT TRUE,
        is_banned       BOOLEAN DEFAULT FALSE,
        ban_reason      TEXT,
        last_login_at   TIMESTAMPTZ,
        last_login_ip   INET,
        password_changed_at TIMESTAMPTZ,
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        updated_at      TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  },

  // ─── SESSIONS TABLE ──────────────────────────────────────────────────────
  {
    name: 'Create sessions table',
    sql: `
      CREATE TABLE IF NOT EXISTS sessions (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        refresh_token   TEXT UNIQUE NOT NULL,
        device_info     TEXT,
        ip_address      INET,
        user_agent      TEXT,
        is_active       BOOLEAN DEFAULT TRUE,
        expires_at      TIMESTAMPTZ NOT NULL,
        created_at      TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  },

  // ─── WALLETS TABLE ───────────────────────────────────────────────────────
  {
    name: 'Create wallets table',
    sql: `
      CREATE TABLE IF NOT EXISTS wallets (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        account_type    VARCHAR(10) NOT NULL CHECK (account_type IN ('demo', 'live')),
        currency        VARCHAR(20) NOT NULL DEFAULT 'USD',
        balance         NUMERIC(20, 8) NOT NULL DEFAULT 0,
        locked_balance  NUMERIC(20, 8) NOT NULL DEFAULT 0,
        is_active       BOOLEAN DEFAULT TRUE,
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        updated_at      TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, account_type, currency)
      );
    `,
  },

  // ─── TRANSACTIONS TABLE ──────────────────────────────────────────────────
  {
    name: 'Create transactions table',
    sql: `
      CREATE TABLE IF NOT EXISTS transactions (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id         UUID NOT NULL REFERENCES users(id),
        wallet_id       UUID NOT NULL REFERENCES wallets(id),
        type            VARCHAR(30) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'trade_buy', 'trade_sell', 'fee', 'bonus', 'transfer')),
        account_type    VARCHAR(10) NOT NULL CHECK (account_type IN ('demo', 'live')),
        amount          NUMERIC(20, 8) NOT NULL,
        currency        VARCHAR(20) NOT NULL,
        status          VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
        reference       VARCHAR(100) UNIQUE,
        external_tx_id  TEXT,
        blockchain_hash TEXT,
        network         VARCHAR(50),
        from_address    TEXT,
        to_address      TEXT,
        confirmations   INTEGER DEFAULT 0,
        required_confirmations INTEGER DEFAULT 3,
        fee_amount      NUMERIC(20, 8) DEFAULT 0,
        fee_currency    VARCHAR(20),
        provider        VARCHAR(50),
        provider_data   JSONB,
        metadata        JSONB,
        completed_at    TIMESTAMPTZ,
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        updated_at      TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  },

  // ─── ORDERS TABLE ────────────────────────────────────────────────────────
  {
    name: 'Create orders table',
    sql: `
      CREATE TABLE IF NOT EXISTS orders (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id         UUID NOT NULL REFERENCES users(id),
        wallet_id       UUID NOT NULL REFERENCES wallets(id),
        account_type    VARCHAR(10) NOT NULL CHECK (account_type IN ('demo', 'live')),
        symbol          VARCHAR(20) NOT NULL,
        base_currency   VARCHAR(10) NOT NULL,
        quote_currency  VARCHAR(10) NOT NULL,
        side            VARCHAR(4) NOT NULL CHECK (side IN ('buy', 'sell')),
        order_type      VARCHAR(10) NOT NULL DEFAULT 'market' CHECK (order_type IN ('market', 'limit', 'stop', 'stop_limit')),
        status          VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'partially_filled', 'filled', 'cancelled', 'rejected', 'expired')),
        quantity        NUMERIC(20, 8) NOT NULL,
        filled_quantity NUMERIC(20, 8) DEFAULT 0,
        price           NUMERIC(20, 8),
        stop_price      NUMERIC(20, 8),
        avg_fill_price  NUMERIC(20, 8),
        total_value     NUMERIC(20, 8),
        fee_amount      NUMERIC(20, 8) DEFAULT 0,
        fee_currency    VARCHAR(10),
        fee_rate        NUMERIC(10, 6) DEFAULT 0.001,
        external_order_id TEXT,
        provider        VARCHAR(50) DEFAULT 'internal',
        time_in_force   VARCHAR(10) DEFAULT 'GTC',
        expires_at      TIMESTAMPTZ,
        is_demo         BOOLEAN NOT NULL DEFAULT FALSE,
        notes           TEXT,
        metadata        JSONB,
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        updated_at      TIMESTAMPTZ DEFAULT NOW(),
        filled_at       TIMESTAMPTZ
      );
    `,
  },

  // ─── TRADES TABLE ────────────────────────────────────────────────────────
  {
    name: 'Create trades table',
    sql: `
      CREATE TABLE IF NOT EXISTS trades (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id        UUID NOT NULL REFERENCES orders(id),
        user_id         UUID NOT NULL REFERENCES users(id),
        account_type    VARCHAR(10) NOT NULL,
        symbol          VARCHAR(20) NOT NULL,
        side            VARCHAR(4) NOT NULL,
        quantity        NUMERIC(20, 8) NOT NULL,
        price           NUMERIC(20, 8) NOT NULL,
        value           NUMERIC(20, 8) NOT NULL,
        fee_amount      NUMERIC(20, 8) DEFAULT 0,
        fee_currency    VARCHAR(10),
        pnl             NUMERIC(20, 8),
        is_demo         BOOLEAN NOT NULL DEFAULT FALSE,
        executed_at     TIMESTAMPTZ DEFAULT NOW(),
        created_at      TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  },

  // ─── POSITIONS TABLE (Open Positions) ────────────────────────────────────
  {
    name: 'Create positions table',
    sql: `
      CREATE TABLE IF NOT EXISTS positions (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id         UUID NOT NULL REFERENCES users(id),
        account_type    VARCHAR(10) NOT NULL,
        symbol          VARCHAR(20) NOT NULL,
        quantity        NUMERIC(20, 8) NOT NULL DEFAULT 0,
        avg_buy_price   NUMERIC(20, 8),
        current_price   NUMERIC(20, 8),
        unrealized_pnl  NUMERIC(20, 8) DEFAULT 0,
        realized_pnl    NUMERIC(20, 8) DEFAULT 0,
        is_demo         BOOLEAN NOT NULL DEFAULT FALSE,
        opened_at       TIMESTAMPTZ DEFAULT NOW(),
        updated_at      TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, account_type, symbol)
      );
    `,
  },

  // ─── DEPOSITS TABLE ──────────────────────────────────────────────────────
  {
    name: 'Create deposits table',
    sql: `
      CREATE TABLE IF NOT EXISTS deposits (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id         UUID NOT NULL REFERENCES users(id),
        wallet_id       UUID NOT NULL REFERENCES wallets(id),
        amount          NUMERIC(20, 8) NOT NULL,
        currency        VARCHAR(20) NOT NULL,
        network         VARCHAR(50),
        deposit_address TEXT,
        tx_hash         TEXT,
        confirmations   INTEGER DEFAULT 0,
        status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirming', 'completed', 'failed')),
        provider        VARCHAR(50),
        provider_reference TEXT,
        metadata        JSONB,
        confirmed_at    TIMESTAMPTZ,
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        updated_at      TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  },

  // ─── WITHDRAWALS TABLE ───────────────────────────────────────────────────
  {
    name: 'Create withdrawals table',
    sql: `
      CREATE TABLE IF NOT EXISTS withdrawals (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id         UUID NOT NULL REFERENCES users(id),
        wallet_id       UUID NOT NULL REFERENCES wallets(id),
        amount          NUMERIC(20, 8) NOT NULL,
        fee_amount      NUMERIC(20, 8) DEFAULT 0,
        net_amount      NUMERIC(20, 8) NOT NULL,
        currency        VARCHAR(20) NOT NULL,
        network         VARCHAR(50),
        to_address      TEXT NOT NULL,
        tx_hash         TEXT,
        status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'failed', 'rejected')),
        admin_note      TEXT,
        reviewed_by     UUID REFERENCES users(id),
        reviewed_at     TIMESTAMPTZ,
        provider        VARCHAR(50),
        metadata        JSONB,
        completed_at    TIMESTAMPTZ,
        created_at      TIMESTAMPTZ DEFAULT NOW(),
        updated_at      TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  },

  // ─── AUDIT LOGS TABLE ────────────────────────────────────────────────────
  {
    name: 'Create audit_logs table',
    sql: `
      CREATE TABLE IF NOT EXISTS audit_logs (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id         UUID REFERENCES users(id),
        admin_id        UUID REFERENCES users(id),
        action          VARCHAR(100) NOT NULL,
        entity_type     VARCHAR(50),
        entity_id       UUID,
        old_data        JSONB,
        new_data        JSONB,
        ip_address      INET,
        user_agent      TEXT,
        status          VARCHAR(20) DEFAULT 'success',
        error_message   TEXT,
        created_at      TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  },

  // ─── KYC DOCUMENTS TABLE ─────────────────────────────────────────────────
  {
    name: 'Create kyc_documents table',
    sql: `
      CREATE TABLE IF NOT EXISTS kyc_documents (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        document_type   VARCHAR(50) NOT NULL CHECK (document_type IN ('passport', 'national_id', 'drivers_license', 'utility_bill', 'bank_statement')),
        document_number VARCHAR(100),
        file_url        TEXT,
        status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        rejection_reason TEXT,
        reviewed_by     UUID REFERENCES users(id),
        reviewed_at     TIMESTAMPTZ,
        expires_at      DATE,
        created_at      TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  },

  // ─── NOTIFICATIONS TABLE ─────────────────────────────────────────────────
  {
    name: 'Create notifications table',
    sql: `
      CREATE TABLE IF NOT EXISTS notifications (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type            VARCHAR(50) NOT NULL,
        title           VARCHAR(200) NOT NULL,
        message         TEXT NOT NULL,
        is_read         BOOLEAN DEFAULT FALSE,
        data            JSONB,
        created_at      TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  },

  // ─── INDICES ─────────────────────────────────────────────────────────────
  {
    name: 'Create performance indices',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON sessions(refresh_token);
      CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_symbol ON orders(symbol);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
      CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
      CREATE INDEX IF NOT EXISTS idx_positions_user_id ON positions(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    `,
  },

  // ─── AUTO-UPDATE TIMESTAMPS ──────────────────────────────────────────────
  {
    name: 'Create updated_at trigger function',
    sql: `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_wallets_updated_at ON wallets;
      CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
      CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
      CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_positions_updated_at ON positions;
      CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_deposits_updated_at ON deposits;
      CREATE TRIGGER update_deposits_updated_at BEFORE UPDATE ON deposits
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_withdrawals_updated_at ON withdrawals;
      CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON withdrawals
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `,
  },
]

async function runMigrations() {
  logger.info('🗃️  Starting Emperor FX database migrations...\n')

  for (const migration of migrations) {
    try {
      await query(migration.sql)
      logger.info(`  ✅ ${migration.name}`)
    } catch (err) {
      logger.error(`  ❌ ${migration.name}: ${err.message}`)
      throw err
    }
  }

  logger.info('\n🎉 All migrations completed successfully!')
  process.exit(0)
}

runMigrations().catch((err) => {
  logger.error('Migration failed:', err)
  process.exit(1)
})
