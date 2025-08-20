/* eslint-disable no-barrel-files/no-barrel-files */
/**
 * Database Schema Aggregator
 *
 * This module serves as the central export point for all database schema definitions.
 * It aggregates schemas from various domain modules, providing a single import point
 * for the database connection and ORM configuration.
 *
 * Current schema modules:
 * - Authentication: User accounts, sessions, API keys, and multi-factor authentication
 *
 * Future schema modules can be added here as the application grows:
 * - Assets: Tokenized assets, transactions, and ownership records
 * - Compliance: KYC/AML data, regulatory compliance records
 * - Audit: System audit logs and transaction history
 *
 * This pattern allows for modular schema organization while maintaining
 * a clean import structure throughout the application.
 * @see {@link ./schemas/auth} - Authentication and authorization schemas
 */

export * from "../auth/db/auth";
export * from "./schemas/exchange-rates";
export * from "./schemas/kyc";
export * from "./schemas/settings";
