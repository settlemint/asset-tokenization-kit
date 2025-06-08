import { bootstrapContract } from "@/lib/orpc/routes/bootstrap/bootstrap.contract";
import { planetContract } from "@/lib/orpc/routes/planet/planet.contract";

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
   * Bootstrap-related API contract.
   *
   * Contains type definitions for all bootstrap-specific procedures including
   * input/output schemas, error types, and procedure metadata. This contract
   * ensures that client calls to bootstrap procedures are type-safe and that
   * the server implementation matches the expected interface.
   *
   * @see {@link ./bootstrap/bootstrap.contract} - Bootstrap contract implementation
   * @see {@link ./bootstrap/bootstrap.router} - Corresponding router implementation
   */
  bootstrap: bootstrapContract,

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
};
