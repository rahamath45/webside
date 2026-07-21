-- ============================================================
-- Webside Database Schema
-- PostgreSQL 16
-- ============================================================

-- Users table (signup data)
CREATE TABLE IF NOT EXISTS users (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      VARCHAR(255) NOT NULL,
  email     VARCHAR(255) UNIQUE NOT NULL,
  password  VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  verification_token_expires TIMESTAMP WITH TIME ZONE,
  totp_secret VARCHAR(255),
  totp_enabled BOOLEAN DEFAULT FALSE,
  totp_backup_codes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table (20-question chat / form data)
CREATE TABLE IF NOT EXISTS applications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email          VARCHAR(255) NOT NULL,
  organization_name   TEXT,
  contact_person_name TEXT,
  contact_email       TEXT,
  product_name        TEXT,
  product_category    TEXT,
  deployment_model    TEXT,
  brief_description   TEXT,
  key_features        TEXT,
  indigenous_content  TEXT,
  ip_ownership        TEXT,
  foreign_components  TEXT,
  sbom_availability   TEXT,
  sbom_format         TEXT,
  poc_availability    TEXT,
  awards              TEXT,
  benchmarking        TEXT,
  deployments         TEXT,
  ai_assessment       TEXT,
  rvd_policy          TEXT,
  submitted_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for pending signups (OTP verification flow)
CREATE TABLE IF NOT EXISTS pending_users (
  email VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Table for session token blacklist (logout)
CREATE TABLE IF NOT EXISTS token_blacklist (
  jti VARCHAR(255) PRIMARY KEY,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_applications_user_email ON applications (user_email);
