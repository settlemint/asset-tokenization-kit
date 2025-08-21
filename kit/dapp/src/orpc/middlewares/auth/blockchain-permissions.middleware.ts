/**
 * Blockchain Permissions Middleware for ORPC Procedures
 *
 * @remarks
 * This middleware implements role-based access control (RBAC) for blockchain operations
 * by validating user permissions against smart contract access control systems.
 * It bridges the gap between off-chain authentication and on-chain authorization.
 *
 * ARCHITECTURAL PATTERN:
 * - Middleware factory pattern for reusable permission checking across procedures
 * - Dynamic access control resolution based on procedure input (contract address, etc.)
 * - Type-safe role requirement validation with complex AND/OR logic support
 * - Integration with TheGraph for real-time on-chain permission state
 *
 * SECURITY BOUNDARIES:
 * - User wallet address must match authenticated session
 * - Roles are fetched from on-chain access control contracts (source of truth)
 * - Permission checks occur before any blockchain interaction
 * - Supports complex role requirements (admin OR (issuer AND investor))
 *
 * PERFORMANCE CONSIDERATIONS:
 * - Access control data cached by TheGraph indexing
 * - Role validation uses efficient bitwise operations
 * - Middleware short-circuits on permission failure (no unnecessary processing)
 *
 * @see {@link getUserRoles} Helper to extract user roles from access control data
 * @see {@link satisfiesRoleRequirement} Complex role requirement validation logic
 * @see {@link RoleRequirement} Type-safe role requirement definitions
 */

import type { AccessControl } from "@/lib/fragments/the-graph/access-control-fragment";
import type { Context } from "@/orpc/context/context";
import { getUserRoles } from "@/orpc/helpers/access-control-helpers";
import { baseRouter } from "@/orpc/procedures/base.router";
import type { RoleRequirement } from "@atk/zod/role-requirement";
import { satisfiesRoleRequirement } from "@atk/zod/role-requirement";
import type { z } from "zod";

/**
 * Creates a middleware function that validates blockchain permissions for ORPC procedures.
 *
 * @remarks
 * MIDDLEWARE FACTORY PATTERN: This function returns a configured middleware that can be
 * applied to any ORPC procedure requiring blockchain permissions. The factory pattern
 * allows for procedure-specific configuration while maintaining type safety.
 *
 * DYNAMIC ACCESS CONTROL: The getAccessControl function enables each procedure to
 * specify how to extract the relevant access control data from its input parameters.
 * This supports various patterns like token-specific permissions, system-wide roles,
 * or factory-based access control.
 *
 * ROLE REQUIREMENT FLEXIBILITY: Supports complex role requirements using AND/OR logic:
 * - Simple: "admin" (user must have admin role)
 * - Complex: { or: ["admin", { and: ["issuer", "investor"] }] }
 * - Nested: { and: ["issuer", { or: ["admin", "manager"] }] }
 *
 * @param requiredRoles - Role requirement specification supporting complex AND/OR logic
 * @param getAccessControl - Function to extract access control data from procedure context and input
 * @returns Configured ORPC middleware function for blockchain permission validation
 * @example
 * ```typescript
 * // Simple admin-only permission
 * const adminOnlyMiddleware = blockchainPermissionsMiddleware({
 *   requiredRoles: "admin",
 *   getAccessControl: ({ context }) => context.system?.accessControl
 * });
 *
 * // Complex role requirement for token operations
 * const tokenOperationMiddleware = blockchainPermissionsMiddleware({
 *   requiredRoles: { or: ["admin", { and: ["issuer", "token_manager"] }] },
 *   getAccessControl: ({ input }) => {
 *     // Extract access control from token-specific contract
 *     return getTokenAccessControl(input.tokenAddress);
 *   }
 * });
 *
 * // Apply to ORPC procedure
 * const mintTokenProcedure = baseRouter
 *   .use(tokenOperationMiddleware)
 *   .mutation(async ({ input, context }) => {
 *     // User permissions already validated by middleware
 *     return await mintTokens(input);
 *   });
 * ```
 */
export const blockchainPermissionsMiddleware = <InputSchema extends z.ZodType>({
  requiredRoles,
  getAccessControl,
}: {
  requiredRoles: RoleRequirement;
  getAccessControl: (data: {
    context: Context;
    input: z.infer<InputSchema>;
  }) => AccessControl | undefined;
}) =>
  baseRouter.middleware(async ({ context, next, errors }, input) => {
    const { auth, system } = context;

    // SYSTEM CONTEXT VALIDATION
    // WHY: System context contains blockchain connection and access control data
    // required for permission validation. Without it, we cannot verify on-chain roles.
    if (!system) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "System context not set",
      });
    }

    // DYNAMIC ACCESS CONTROL RESOLUTION
    // WHY: Each procedure may need different access control data (token-specific,
    // system-wide, factory-based). The resolver function allows procedure-specific
    // logic while maintaining type safety and reusable middleware.
    const accessControl = getAccessControl({
      context,
      input: input as z.infer<InputSchema>,
    });

    if (!accessControl) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Access control not set",
      });
    }

    // USER ROLE EXTRACTION
    // WHY: Roles are fetched from on-chain access control contracts via TheGraph.
    // This ensures we have the most current permission state and prevents
    // authorization bypass through stale off-chain data.
    const userRoles = auth ? getUserRoles(auth.user.wallet, accessControl) : [];

    // PERMISSION VALIDATION
    // WHY: Complex role requirements support business logic like "admin OR (issuer AND investor)".
    // This enables flexible permission models while maintaining security boundaries.
    // Early return on failure prevents unnecessary processing of unauthorized requests.
    if (!satisfiesRoleRequirement(userRoles, requiredRoles)) {
      throw errors.USER_NOT_AUTHORIZED({
        data: {
          requiredRoles, // Include requirement details for debugging and audit logs
        },
      });
    }

    // AUTHORIZATION SUCCESS: Proceed to procedure execution
    // User has been validated against on-chain access control system
    return next();
  });
