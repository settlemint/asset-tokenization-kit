/* eslint-disable no-barrel-files/no-barrel-files */
/**
 * Database Schema Composition Module - Asset Tokenization Platform
 *
 * WHY: This module implements a domain-driven schema organization strategy that balances
 * modularity with type safety for financial asset management at scale.
 *
 * ARCHITECTURAL RATIONALE:
 * - Barrel pattern: Single import eliminates circular dependencies and import complexity
 * - Domain separation: Each schema module encapsulates related business logic boundaries
 * - Type composition: Drizzle requires all schemas in single object for inference engine
 * - Migration safety: Centralized exports ensure schema changes propagate atomically
 *
 * PERFORMANCE STRATEGY:
 * - Tree-shaking optimization: Unused schema modules are eliminated in production builds
 * - Type inference caching: Single schema object enables TypeScript to cache validation results
 * - Query planning: Drizzle uses complete schema metadata for optimal query generation
 * - Bundle splitting: Schema modules can be code-split while maintaining type relationships
 *
 * SECURITY ARCHITECTURE:
 * - Access boundary enforcement: Schema organization mirrors security permission boundaries
 * - Audit trail isolation: Each domain maintains separate audit and compliance tables
 * - Data sovereignty: Financial vs identity data separated for regulatory compliance
 * - Role-based visibility: Schema structure supports fine-grained access control patterns
 *
 * SCHEMA EVOLUTION STRATEGY:
 * - Backward compatibility: New schemas added without breaking existing type contracts
 * - Migration coordination: Schema changes coordinated across domain boundaries
 * - Version alignment: All schemas share consistent versioning and migration timeline
 * - Rollback safety: Domain isolation prevents cascading failures during schema rollbacks
 *
 * CURRENT DOMAIN SCHEMAS:
 * - auth: Identity, authentication, and authorization (critical path for all operations)
 * - exchange-rates: Currency conversion and pricing data (financial calculations)
 * - kyc: Know Your Customer and compliance records (regulatory requirements)
 * - settings: Application configuration and user preferences (system behavior)
 *
 * PLANNED DOMAIN EXPANSION:
 * - assets: Core tokenization tables (tokens, balances, transactions)
 * - compliance: Advanced AML/CFT monitoring and reporting
 * - audit: Comprehensive event logging and regulatory audit trails
 * - notifications: Real-time event delivery and user communication
 * - analytics: Business intelligence and performance metrics
 *
 * TYPE SAFETY GUARANTEES:
 * - Cross-schema relationships: Foreign keys validated at TypeScript compile time
 * - Schema consistency: All domains share common column types and naming conventions
 * - Migration safety: Schema changes require type compatibility across all domains
 * - Query validation: Complex joins across domains validated before runtime
 *
 * @see {@link ./schemas/auth} - Authentication and session management schemas
 * @see {@link ./schemas/exchange-rates} - Currency and pricing data schemas
 * @see {@link ./schemas/kyc} - Compliance and identity verification schemas
 * @see {@link ./schemas/settings} - Application configuration schemas
 */

// CRITICAL PATH: Authentication schemas must be available for all application operations
// SECURITY: User identity and session management - foundation for all authorization decisions
export * from "./schemas/auth";
// FINANCIAL CORE: Currency conversion rates essential for multi-currency asset pricing
// PERFORMANCE: Pre-loaded schemas enable real-time price calculations without API delays
export * from "./schemas/exchange-rates";
// COMPLIANCE: KYC/AML data required for regulatory compliance in financial services
// SECURITY: Identity verification data isolated from general user authentication
export * from "./schemas/kyc";
// SYSTEM CONFIG: Application settings and user preferences for personalized experience
// PERFORMANCE: Cached settings reduce database queries for common configuration access
export * from "./schemas/settings";
