/**
 * Server-Side Authentication Configuration
 *
 * This module configures the server-side authentication system using Better Auth.
 * It provides a comprehensive authentication solution with support for:
 * - Email/password authentication
 * - API key authentication for programmatic access
 * - Passkey/WebAuthn for passwordless authentication
 * - Multi-factor authentication (pincode, 2FA, secret code)
 * - Admin functionality for user management
 * - Session management with secure cookie handling
 *
 * The configuration includes custom user fields specific to the blockchain
 * application, such as wallet addresses and various verification methods.
 * @see {@link ./auth.client} - Client-side authentication configuration
 * @see {@link ../db/schemas/auth} - Database schema for authentication
 */

import { metadata } from "@/config/metadata";
import {
  accessControl,
  adminRole,
  investorRole,
  issuerRole,
} from "@/lib/auth/permissions";
import { pincode } from "@/lib/auth/plugins/pincode-plugin";
import { secretCodes } from "@/lib/auth/plugins/secret-codes-plugin";
import { twoFactor } from "@/lib/auth/plugins/two-factor";
import { wallet } from "@/lib/auth/plugins/wallet-plugin";
import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import type { UserRole } from "@/lib/zod/validators/user-roles";
import { serverOnly } from "@tanstack/react-start";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { admin, apiKey, openAPI } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { reactStartCookies } from "better-auth/react-start";
import { eq } from "drizzle-orm/sql";
import { db } from "../db";
import * as authSchema from "../db/schemas/auth";
import { env } from "../env";

/**
 * Creates the authentication configuration.
 *
 * This function is wrapped with `serverOnly` to ensure it only runs on the server,
 * preventing sensitive configuration like secrets from being exposed to the client.
 */
const getAuthConfig = serverOnly(() =>
  betterAuth({
    /**
     * Application name used in authentication flows and emails.
     */
    appName: metadata.title,

    /**
     * Secret key for signing tokens and cookies.
     * Uses the Hasura admin secret for consistency across services.
     */
    secret: env.SETTLEMINT_HASURA_ADMIN_SECRET,

    /**
     * Base URL for the authentication endpoints.
     * Used for generating absolute URLs in emails and redirects.
     */
    baseURL: env.APP_URL,

    /**
     * Trusted origins for CORS configuration.
     * Only included if APP_URL is defined to prevent development issues.
     */
    ...(env.APP_URL && { trustedOrigins: [env.APP_URL] }),

    /**
     * Database adapter configuration using Drizzle ORM.
     * Connects authentication to the PostgreSQL database.
     */
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: authSchema,
    }),
    /**
     * Email and password authentication configuration.
     * Email verification is disabled for faster onboarding in this environment.
     */
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },

    /**
     * User management configuration with custom fields for blockchain integration.
     */
    user: {
      /**
       * Allow users to delete their accounts (GDPR compliance).
       */
      deleteUser: {
        enabled: true,
      },

      /**
       * Allow users to change their email addresses.
       */
      changeEmail: {
        enabled: true,
      },

      /**
       * Custom user fields for blockchain and multi-factor authentication.
       * All fields are set to input: false to prevent direct user modification.
       */
      additionalFields: {
        /**
         * Ethereum wallet address for blockchain transactions.
         * Unique to ensure one wallet per user account.
         */
        wallet: {
          type: "string",
          required: false,
          unique: true,
          input: false,
        },
        /**
         * The last time the user logged in.
         */
        lastLoginAt: {
          type: "date",
          required: false,
          input: false,
        },
        /**
         * The role of the user.
         */
        role: {
          type: "string",
          required: true,
          defaultValue: "investor",
          input: false,
        },
        /**
         * Whether the user has enabled pincode.
         */
        pincodeEnabled: {
          type: "boolean",
          required: false,
          defaultValue: false,
          input: false,
        },
        /**
         * The verification id for the pincode.
         */
        pincodeVerificationId: {
          type: "string",
          required: false,
          unique: true,
          input: false,
        },
        /**
         * Whether the user has enabled two-factor authentication.
         * Only set after the first otp code is verified.
         */
        twoFactorEnabled: {
          type: "boolean",
          required: false,
          defaultValue: false,
          input: false,
        },
        /**
         * The verification id for the two-factor authentication.
         */
        twoFactorVerificationId: {
          type: "string",
          required: false,
          unique: true,
          input: false,
        },
        /**
         * The verification id for the secret code.
         */
        secretCodeVerificationId: {
          type: "string",
          required: false,
          unique: true,
          input: false,
        },
        /**
         * Whether the user has finished the initial onboarding.
         */
        initialOnboardingFinished: {
          type: "boolean",
          required: false,
          defaultValue: false,
          input: false,
        },
      },
    },
    /**
     * Session management configuration.
     */
    session: {
      session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
        freshAge: 60 * 5, // 5 minutes (the session is fresh if created within the last 5 minutes)
      },
      /**
       * Cookie caching for improved performance.
       * Reduces database queries by caching session data in cookies.
       */
      cookieCache: {
        enabled: true,
        maxAge: 10 * 60, // 10 minutes
      },
    },

    /**
     * Rate limiting configuration to prevent abuse.
     */
    rateLimit: {
      window: 10, // time window in seconds
      max: 100, // max requests in the window
    },

    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            try {
              const firstUser = await db.query.user.findFirst();
              return {
                data: {
                  ...user,
                  role: firstUser ? "investor" : "admin",
                },
              };
            } catch (error) {
              throw new APIError("BAD_REQUEST", {
                message: "Failed to set the user role",
                cause: error instanceof Error ? error : undefined,
              });
            }
          },
        },
      },
      session: {
        create: {
          before: async (session) => {
            const lastLoginAt = new Date();
            await db
              .update(authSchema.user)
              .set({
                lastLoginAt,
              })
              .where(eq(authSchema.user.id, session.userId));
            return {
              data: session,
            };
          },
        },
      },
    },

    /**
     * Authentication plugins for extended functionality.
     */
    plugins: [
      /**
       * Admin plugin for user management capabilities.
       */
      admin({
        ac: accessControl,
        roles: {
          admin: adminRole,
          user: investorRole,
          issuer: issuerRole,
        },
      }),

      /**
       * API key plugin configuration for programmatic access.
       */
      apiKey({
        defaultKeyLength: 16,
        defaultPrefix: "sm_atk_", // SettleMint Asset Tokenization Kit prefix
        enableMetadata: true,
        rateLimit: {
          enabled: true,
          timeWindow: 1000 * 60, // 1 minute
          maxRequests: 60, // 60 requests per minute
        },
        permissions: {
          // TODO: assing a role to the api key when created
          defaultPermissions: {
            planets: ["read"], // Default read-only permissions
          },
        },
      }),

      /**
       * Passkey plugin for WebAuthn support.
       * Uses the application name as the relying party name.
       */
      passkey({
        rpName: metadata.title,
      }),

      /**
       * OpenAPI plugin for API documentation generation.
       */
      openAPI(),

      /**
       * React Start cookie integration for SSR support.
       */
      reactStartCookies(),

      /**
       * Plugin for pincode authentication.
       */
      pincode(),

      /**
       * Plugin for two-factor authentication.
       */
      twoFactor(),

      /**
       * Plugin for secret codes authentication.
       */
      secretCodes(),

      /**
       * Plugin for wallet integration.
       */
      wallet(),
    ],
  })
);

/**
 * The main authentication instance.
 *
 * This instance is used throughout the server-side application for:
 * - Authenticating users
 * - Managing sessions
 * - Handling API keys
 * - User management operations
 */
export const auth = getAuthConfig();

/**
 * Type definition for authentication sessions.
 * Inferred from the Better Auth configuration.
 */
export type Session = typeof auth.$Infer.Session;

/**
 * Enhanced type for session users with proper typing.
 */
export type SessionUser = Omit<Session["user"], "wallet" | "role"> & {
  wallet?: EthereumAddress | null;
  role: UserRole;
};
