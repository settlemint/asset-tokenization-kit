/**
 * ORPC Contract Definitions for PIN Code Management API
 *
 * @remarks
 * This module defines the OpenAPI-compatible contract specifications for PIN code
 * management endpoints, establishing the HTTP interface, validation schemas, and
 * documentation for wallet security operations.
 *
 * CONTRACT DESIGN PHILOSOPHY:
 * - RESTful HTTP semantics for intuitive API behavior (POST for creation, PATCH for updates)
 * - Zod schema integration for runtime validation and TypeScript type generation
 * - Comprehensive OpenAPI documentation for frontend integration and testing
 * - Consistent error handling patterns across all PIN operations
 *
 * HTTP METHOD RATIONALE:
 * - POST /user/pincode: Idempotent PIN creation (fails if already exists)
 * - PATCH /user/pincode: PIN modification (requires existing PIN state)
 * - DELETE /user/pincode: PIN removal (idempotent - succeeds if already removed)
 *
 * SECURITY CONSIDERATIONS:
 * - PIN values are never included in response bodies (only success flags)
 * - Verification IDs are opaque tokens that don't expose PIN structure
 * - Tags enable proper security categorization in API documentation
 * - Input validation prevents malformed PIN attempts at the HTTP layer
 *
 * INTEGRATION STRATEGY:
 * - Contracts enable automatic OpenAPI generation for frontend client libraries
 * - Schema reuse ensures validation consistency between client and server
 * - Type inference provides end-to-end type safety from HTTP to database
 * - Error schemas standardize error handling across all PIN operations
 *
 * @see {@link @/orpc/procedures/base.contract} Base contract for shared middleware
 * @see {@link ./pincode.set.schema} PIN creation validation schemas
 * @see {@link ./pincode.update.schema} PIN update validation schemas
 * @see {@link ./pincode.remove.schema} PIN removal validation schemas
 */

import { baseContract } from "@/orpc/procedures/base.contract";
import { PincodeRemoveOutputSchema } from "@/orpc/routes/user/pincode/pincode.remove.schema";
import {
  PincodeSetInputSchema,
  PincodeSetOutputSchema,
} from "@/orpc/routes/user/pincode/pincode.set.schema";
import {
  PincodeUpdateInputSchema,
  PincodeUpdateOutputSchema,
} from "@/orpc/routes/user/pincode/pincode.update.schema";

/**
 * Contract for initial PIN code establishment.
 *
 * @remarks
 * WHY POST: PIN creation is a one-time initialization operation that should fail
 * if a PIN already exists, following RESTful creation semantics.
 *
 * SECURITY: Input validation occurs at multiple layers:
 * 1. HTTP layer (this contract) - format and structure validation
 * 2. Business logic layer - duplicate prevention and wallet verification
 * 3. Portal layer - cryptographic hashing and secure storage
 */
const set = baseContract
  .route({
    method: "POST",
    path: "/user/pincode",
    description: "Set pincode for the user",
    successDescription: "Pincode set successfully",
    tags: ["user", "security"],
  })
  .input(PincodeSetInputSchema)
  .output(PincodeSetOutputSchema);

/**
 * Contract for PIN code modification.
 *
 * @remarks
 * WHY PATCH: PIN updates are partial modifications of existing security state,
 * requiring the PIN to already exist before modification can occur.
 *
 * IDEMPOTENCY: Setting the same PIN value multiple times produces the same result
 * (new verification ID), enabling safe retry behavior for network failures.
 */
const update = baseContract
  .route({
    method: "PATCH",
    path: "/user/pincode",
    description: "Update pincode for the user",
    successDescription: "Pincode updated successfully",
    tags: ["user", "security"],
  })
  .input(PincodeUpdateInputSchema)
  .output(PincodeUpdateOutputSchema);

/**
 * Contract for PIN code removal and security state cleanup.
 *
 * @remarks
 * WHY DELETE: PIN removal completely eliminates the security feature, following
 * RESTful deletion semantics where the resource ceases to exist.
 *
 * NO INPUT: Removal operates on the authenticated user's PIN only, preventing
 * accidental deletion of other users' security settings.
 *
 * IDEMPOTENCY: Removing an already-removed PIN succeeds gracefully, enabling
 * safe retry behavior and preventing client-side error handling complexity.
 */
const remove = baseContract
  .route({
    method: "DELETE",
    path: "/user/pincode",
    description: "Remove pincode for the user",
    successDescription: "Pincode removed successfully",
    tags: ["user", "security"],
  })
  .output(PincodeRemoveOutputSchema);

// WHY: Named export pattern enables tree-shaking and selective contract usage
export const pincodeContract = {
  set,
  update,
  remove,
};
