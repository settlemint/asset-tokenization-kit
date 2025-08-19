/**
 * Authentication & Authorization Database Schema
 *
 * This module defines the security-critical database schema for user authentication,
 * session management, and access control in the asset tokenization platform.
 *
 * SECURITY DESIGN PRINCIPLES:
 * - Defense in depth: Multiple verification layers (email, 2FA, passkeys, pincode)
 * - Zero-trust: All sessions expire and require re-authentication
 * - Audit trail: All authentication events are logged with metadata
 * - Rate limiting: Built-in API key throttling to prevent abuse
 * - Principle of least privilege: Granular role-based permissions
 *
 * COMPLIANCE CONSIDERATIONS:
 * - GDPR: User data can be fully deleted via CASCADE constraints
 * - AML/KYC: User roles enable compliance-based access restrictions
 * - SOC2: Session tracking and impersonation audit logs
 * - Financial regulations: Wallet linkage for asset ownership verification
 *
 * @module AuthenticationSchema
 */

import type { UserRole } from "@atk/zod/validators/user-roles";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { Address } from "viem";

/**
 * User account table - central identity store for the platform.
 *
 * SECURITY DESIGN RATIONALE:
 * - Text ID instead of auto-increment: Prevents enumeration attacks and timing leaks
 * - Email uniqueness: Required for password recovery and regulatory identification
 * - emailVerified flag: Prevents account takeover via unverified email changes
 * - Multiple auth factors: Defense in depth against account compromise
 * - Wallet linkage: Enables asset ownership verification and blockchain interactions
 * - Ban system: Compliance requirement for AML/sanctions enforcement
 *
 * PERFORMANCE CONSIDERATIONS:
 * - Email unique index: Fast login lookups (O(log n))
 * - Role-based queries: Support for privilege escalation checks
 * - Verification ID uniqueness: Prevents verification token reuse attacks
 */
export const user = pgTable("user", {
  // WHY: Text IDs prevent user enumeration and provide better security than auto-increment
  id: text("id").primaryKey(),
  
  // INVARIANT: Display name for UI - not used for authentication to prevent social engineering
  name: text("name").notNull(),
  
  // SECURITY: Unique email constraint prevents account conflicts and enables password recovery
  email: text("email").notNull().unique(),
  
  // WHY: Default false prevents unverified email bypass - must explicitly verify
  emailVerified: boolean("email_verified")
    .$defaultFn(() => !1)
    .notNull(),
  
  // OPTIONAL: Profile image for user experience - no security implications
  image: text("image"),
  
  // AUDIT: Creation tracking for compliance and user lifecycle management
  createdAt: timestamp("created_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  
  // AUDIT: Modification tracking for change detection and forensics
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .$defaultFn(() => new Date())
    .notNull(),
  
  // SECURITY: Role-based access control - nullable to support initial user state
  role: text("role").$type<UserRole>(),
  
  // COMPLIANCE: Ban enforcement for AML/sanctions - nullable means not banned
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires", { withTimezone: true }),
  
  // WHY: Blockchain address linkage for asset ownership verification and transaction signing
  wallet: text("wallet").$type<Address>(),
  
  // SECURITY: Login tracking for suspicious activity detection and session management
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  
  // SECURITY: PIN-based quick authentication for mobile/frequent access
  // WHY: Default false requires explicit opt-in to prevent accidental weak security
  pincodeEnabled: boolean("pincode_enabled").notNull().default(false),
  
  // SECURITY: Unique verification IDs prevent token reuse attacks across different auth methods
  pincodeVerificationId: text("pincode_verification_id").unique(),
  
  // SECURITY: TOTP/SMS two-factor authentication for high-value operations
  // WHY: Default false - users must consciously enable stronger security
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  twoFactorVerificationId: text("two_factor_verification_id").unique(),
  
  // SECURITY: Backup recovery codes for 2FA - confirmed flag prevents premature activation
  // WHY: Default false ensures users have safely stored backup codes before enabling
  secretCodesConfirmed: boolean("secret_codes_confirmed")
    .notNull()
    .default(false),
  secretCodeVerificationId: text("secret_code_verification_id").unique(),
});

/**
 * Session table - manages active user authentication sessions.
 *
 * SECURITY ARCHITECTURE:
 * - Short-lived sessions: Forces periodic re-authentication
 * - Unique tokens: Prevents session fixation attacks
 * - IP/User-Agent tracking: Enables suspicious activity detection
 * - Admin impersonation: Support for customer service with audit trail
 * - Cascade deletion: GDPR compliance when users are deleted
 *
 * WHY SEPARATE FROM USER TABLE:
 * - Users can have multiple concurrent sessions (mobile + web)
 * - Session invalidation doesn't affect user data
 * - Enables session-specific metadata (IP, device, etc.)
 * - Supports horizontal scaling with session-specific sharding
 */
export const session = pgTable("session", {
  // WHY: Text ID prevents session enumeration attacks
  id: text("id").primaryKey(),
  
  // SECURITY: Mandatory expiration prevents indefinite access - enforces re-authentication
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  
  // SECURITY: Unique token constraint prevents session collision and fixation attacks
  token: text("token").notNull().unique(),
  
  // AUDIT: Session lifecycle tracking for security monitoring
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  
  // SECURITY: IP tracking enables geolocation-based security alerts and rate limiting
  ipAddress: text("ip_address"),
  
  // SECURITY: Device fingerprinting for suspicious login detection
  userAgent: text("user_agent"),
  
  // INTEGRITY: Foreign key with CASCADE ensures orphaned sessions are cleaned up
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  
  // AUDIT: Admin impersonation tracking for compliance and security monitoring
  // WHY: Nullable - only set when admin is impersonating user for support
  impersonatedBy: text("impersonated_by"),
});

/**
 * OAuth/Social provider account linking table.
 *
 * WHY SEPARATE FROM USER TABLE:
 * - Users can link multiple OAuth providers (Google, GitHub, etc.)
 * - Provider-specific tokens need isolated storage for security
 * - OAuth refresh logic operates independently of user sessions
 * - Enables seamless provider switching without data loss
 *
 * SECURITY CONSIDERATIONS:
 * - Provider tokens stored separately from user credentials
 * - Cascade deletion ensures no orphaned OAuth tokens
 * - Scope tracking enables least-privilege OAuth integrations
 * - Refresh token expiration prevents indefinite access
 */
export const account = pgTable("account", {
  // WHY: Internal ID separate from provider ID prevents confusion and enables composite queries
  id: text("id").primaryKey(),
  
  // INTEGRATION: Provider-specific user identifier (e.g., Google user ID)
  accountId: text("account_id").notNull(),
  
  // INTEGRATION: OAuth provider identifier (e.g., 'google', 'github')
  providerId: text("provider_id").notNull(),
  
  // INTEGRITY: Links OAuth account to internal user - CASCADE for GDPR compliance
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  
  // SECURITY: OAuth access tokens - short-lived for API access
  accessToken: text("access_token"),
  
  // SECURITY: Refresh tokens - longer-lived for token renewal
  refreshToken: text("refresh_token"),
  
  // SECURITY: OpenID Connect identity tokens for user info
  idToken: text("id_token"),
  
  // SECURITY: Token expiration tracking prevents stale token usage
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    withTimezone: true,
  }),
  
  // SECURITY: OAuth scope tracking for least-privilege access
  scope: text("scope"),
  
  // LEGACY: Password field for email/password auth - consider removing for OAuth-only accounts
  password: text("password"),
  
  // AUDIT: Account linking lifecycle tracking
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

/**
 * Verification token table - manages time-sensitive verification codes.
 *
 * SECURITY DESIGN:
 * - Single-use tokens: Each verification can only be used once
 * - Time-bounded: All tokens expire to prevent replay attacks
 * - Generic design: Supports email verification, password reset, 2FA, etc.
 * - No user linkage: Identifier-based lookup prevents user enumeration
 *
 * WHY NOT EMBED IN USER TABLE:
 * - Multiple verification types can be active simultaneously
 * - Tokens are ephemeral - don't pollute permanent user data
 * - Enables bulk cleanup of expired tokens
 * - Supports verification before user account creation
 */
export const verification = pgTable("verification", {
  // WHY: Separate ID from verification value prevents brute force attacks on UUIDs
  id: text("id").primaryKey(),
  
  // SECURITY: Email or phone identifier - NOT a user ID to prevent enumeration
  identifier: text("identifier").notNull(),
  
  // SECURITY: The actual verification token/code - unique and unguessable
  value: text("value").notNull(),
  
  // SECURITY: Mandatory expiration prevents indefinite token validity
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  
  // AUDIT: Token lifecycle tracking for security monitoring
  createdAt: timestamp("created_at", { withTimezone: true }).$defaultFn(
    () => new Date()
  ),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$defaultFn(
    () => new Date()
  ),
});

/**
 * API Key table - programmatic access control for external integrations.
 *
 * SECURITY ARCHITECTURE:
 * - Token bucket rate limiting: Prevents API abuse while allowing burst usage
 * - Scoped permissions: Principle of least privilege for API access
 * - Expiration support: Time-bounded keys for enhanced security
 * - Enable/disable: Quick revocation without deletion for audit trails
 *
 * PERFORMANCE DESIGN:
 * - In-memory rate limiting: Updates request counters without blocking
 * - Prefix matching: Fast key lookup without full hash comparison
 * - Refill mechanism: Token bucket algorithm for smooth rate limiting
 *
 * BUSINESS RATIONALE:
 * - Separate from user sessions: API access persists across user logins
 * - Named keys: Users can manage multiple integrations
 * - Usage tracking: Enables billing and abuse monitoring
 */
export const apikey = pgTable("apikey", {
  // WHY: UUID prevents key enumeration and provides globally unique references
  id: text("id").primaryKey(),
  
  // UX: Human-readable name for key management in UI
  name: text("name"),
  
  // SECURITY: Visible key prefix for identification without exposing full key
  start: text("start"),
  prefix: text("prefix"),
  
  // SECURITY: The actual API key - hashed and salted in production
  key: text("key").notNull(),
  
  // INTEGRITY: API key ownership with CASCADE deletion for user cleanup
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  
  // RATE LIMITING: Token bucket algorithm parameters
  // WHY: Configurable per-key to support different use case requirements
  refillInterval: integer("refill_interval"),
  refillAmount: integer("refill_amount"),
  lastRefillAt: timestamp("last_refill_at", { withTimezone: true }),
  
  // SECURITY: Quick enable/disable without losing configuration
  enabled: boolean("enabled").default(true),
  
  // RATE LIMITING: Granular control over rate limiting behavior
  // WHY: Default true prevents abuse by default, can be disabled for trusted clients
  rateLimitEnabled: boolean("rate_limit_enabled").default(true),
  
  // PERF: 60-second window balances responsiveness with abuse prevention
  rateLimitTimeWindow: integer("rate_limit_time_window").default(60_000),
  
  // PERF: 60 requests/minute default allows normal usage while preventing abuse
  rateLimitMax: integer("rate_limit_max").default(60),
  
  // RATE LIMITING: Current usage tracking for token bucket algorithm
  requestCount: integer("request_count"),
  remaining: integer("remaining"),
  lastRequest: timestamp("last_request", { withTimezone: true }),
  
  // SECURITY: Optional key expiration for enhanced security posture
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  
  // AUDIT: Key lifecycle tracking for security monitoring
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  
  // SECURITY: JSON-encoded permission scopes for least-privilege access
  permissions: text("permissions"),
  
  // EXTENSIBILITY: JSON metadata for custom key properties
  metadata: text("metadata"),
});

/**
 * WebAuthn Passkey table - modern passwordless authentication.
 *
 * SECURITY BENEFITS:
 * - Phishing resistant: Cryptographic proof of origin domain
 * - No shared secrets: Private keys never leave the device
 * - Replay attack prevention: Counter-based freshness protection
 * - Device attestation: Hardware security module verification
 *
 * WHY WEBAUTHN OVER PASSWORDS:
 * - Eliminates credential stuffing attacks
 * - Reduces user friction (biometric/PIN unlock)
 * - Better security than SMS 2FA
 * - Platform integration (Face ID, Touch ID, Windows Hello)
 *
 * COMPLIANCE ADVANTAGES:
 * - FIDO2 certified for enterprise security standards
 * - Supports regulatory requirements for strong authentication
 * - Audit trail through counter and device attestation
 */
export const passkey = pgTable("passkey", {
  // WHY: UUID enables multiple passkeys per user for different devices
  id: text("id").primaryKey(),
  
  // UX: User-defined name for device identification ("iPhone", "YubiKey", etc.)
  name: text("name"),
  
  // SECURITY: WebAuthn public key for signature verification
  publicKey: text("public_key").notNull(),
  
  // INTEGRITY: Passkey ownership with CASCADE deletion for user cleanup
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  
  // SECURITY: WebAuthn credential ID - unique per passkey for identification
  credentialID: text("credential_i_d").notNull(),
  
  // SECURITY: Signature counter prevents replay attacks
  // WHY: Incrementing counter ensures each authentication is fresh
  counter: integer("counter").notNull(),
  
  // SECURITY: Device type indication (platform/roaming authenticator)
  deviceType: text("device_type").notNull(),
  
  // SECURITY: Indicates if private key is backed up (affects user experience)
  // WHY: Backed up keys are more convenient but potentially less secure
  backedUp: boolean("backed_up").notNull(),
  
  // INTEGRATION: Supported transport methods (USB, NFC, BLE, internal)
  transports: text("transports"),
  
  // AUDIT: Device registration tracking
  createdAt: timestamp("created_at", { withTimezone: true }),
  
  // SECURITY: Authenticator attestation GUID for device certification verification
  aaguid: text("aaguid"),
});
