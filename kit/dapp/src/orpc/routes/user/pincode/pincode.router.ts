/**
 * PIN Code Management Router for Wallet Security
 *
 * @remarks
 * This router aggregates all PIN code management procedures into a cohesive API surface
 * for wallet security operations. It implements a complete CRUD pattern for PIN lifecycle
 * management while maintaining strict security boundaries and audit trails.
 *
 * ARCHITECTURAL DECISIONS:
 * - Unified router pattern for discoverability and consistent API organization
 * - Named exports for explicit procedure identification and better tooling support
 * - Stateless procedure design where each operation is atomic and idempotent
 * - Centralized error handling through ORPC middleware chain
 *
 * SECURITY ARCHITECTURE:
 * - All procedures require authenticated user context (via authRouter inheritance)
 * - PIN operations are tied to wallet addresses for cryptographic verification
 * - State synchronization between local DB and Portal verification system
 * - Atomic operations to prevent inconsistent security state
 *
 * BUSINESS CONTEXT:
 * PIN codes serve as a secondary authentication factor for:
 * - High-value transaction signing
 * - Wallet recovery operations
 * - Administrative settings changes
 * - Compliance verification workflows
 *
 * INTEGRATION POINTS:
 * - Portal GraphQL API for cryptographic verification storage
 * - Local database for user preference and feature flag state
 * - Better Auth session for real-time security context updates
 * - Frontend components via ORPC client type-safe bindings
 *
 * @see {@link ./pincode.set} Initial PIN establishment procedure
 * @see {@link ./pincode.update} PIN modification with verification
 * @see {@link ./pincode.remove} PIN removal and cleanup procedure
 * @see {@link ../../../lib/auth/plugins/pincode-plugin} Better Auth integration
 */

import { remove } from "@/orpc/routes/user/pincode/pincode.remove";
import { set } from "@/orpc/routes/user/pincode/pincode.set";
import { update } from "@/orpc/routes/user/pincode/pincode.update";

// WHY: Object structure enables type-safe procedure discovery and consistent naming
const routes = {
  set,
  update,
  remove,
};

export default routes;
