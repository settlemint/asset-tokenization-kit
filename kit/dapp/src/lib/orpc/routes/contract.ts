import { planetContract } from "@/lib/orpc/routes/planet/planet.contract";
import { systemContract } from "./system/system.contract";

/**
 * Main ORPC contract definition.
 *
 * This contract serves as the type-safe API specification that defines the
 * structure and types for all available API procedures. It acts as a bridge
 * between the server-side router implementation and the client-side usage,
 * ensuring full TypeScript type safety across the entire API surface.
 *
 * The contract is used by:
 * - Client-side code for type-safe API calls and auto-completion
 * - OpenAPI documentation generation
 * - Runtime validation of requests and responses
 * - Development-time type checking and IntelliSense
 *
 * Each namespace in the contract corresponds to a router module and contains
 * the type definitions for all procedures within that namespace.
 */
export const contract = {
  /**
   * Planet-related API contract.
   *
   * Contains type definitions for all planet-specific procedures including
   * input/output schemas, error types, and procedure metadata. This contract
   * ensures that client calls to planet procedures are type-safe and that
   * the server implementation matches the expected interface.
   *
   * @see {@link ./planet/planet.contract} - Planet contract implementation
   * @see {@link ./planet/planet.router} - Corresponding router implementation
   */
  planet: planetContract,
  
  /**
   * System-related API contract.
   * 
   * Contains type definitions for SMART system management procedures.
   * Systems are the core entities that manage the lifecycle and compliance
   * of tokenized assets on the blockchain. This contract provides type-safe
   * access to system listing and management operations.
   * 
   * @see {@link ./system/system.contract} - System contract implementation
   * @see {@link ./system/system.router} - Corresponding router implementation
   */
  system: systemContract,
};
