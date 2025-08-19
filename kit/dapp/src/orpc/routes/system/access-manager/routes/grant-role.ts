/**
 * System Access Manager Role Granting Operations
 *
 * @fileoverview
 * Implements secure role granting operations for the Asset Tokenization Kit's access control system.
 * This module provides optimized GraphQL mutations for different role assignment scenarios,
 * balancing transaction cost efficiency with operational flexibility.
 *
 * @remarks
 * ARCHITECTURAL DECISIONS:
 * - Three distinct mutation types optimize gas costs for different use cases
 * - Single address + single role: Most common scenario with minimal gas overhead
 * - Multiple addresses + single role: Batch operation for role distribution
 * - Single address + multiple roles: Efficient multi-role assignment
 * - Multiple addresses + multiple roles: Rejected to prevent blockchain state explosion
 *
 * SECURITY BOUNDARIES:
 * - All operations require wallet verification (OTP/PINCODE/SECRET_CODES)
 * - Permission validation occurs before mutation execution
 * - Role validation prevents assignment of non-existent roles
 * - System access manager validation ensures proper contract context
 *
 * PERFORMANCE CHARACTERISTICS:
 * - Single operations: ~50k gas + verification overhead
 * - Batch operations: Linear scaling with slight per-item gas savings
 * - Role validation: Local lookup with O(1) performance
 * - Duplicate elimination: O(n) preprocessing to prevent redundant blockchain calls
 *
 * @see {@link blockchainPermissionsMiddleware} Permission validation logic
 * @see {@link getRoleByFieldName} Role validation and byte conversion
 */

import { getRoleByFieldName } from "@/lib/constants/roles";
import { portalGraphql } from "@/lib/settlemint/portal";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { portalRouter } from "@/orpc/procedures/portal.router";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";

/**
 * GraphQL mutation for granting a single role to a single address.
 *
 * @remarks
 * OPTIMIZATION: This is the most gas-efficient mutation pattern for role assignment.
 * Used when assigning one specific role to one specific address, which represents
 * the majority of role management operations in typical usage.
 *
 * GAS EFFICIENCY: ~50k gas vs ~80k+ for batch operations with single items
 * SECURITY: Requires wallet verification via challengeId/challengeResponse
 * USE CASE: Individual role assignments, permission escalations, new user onboarding
 */
const GRANT_ROLE_MUTATION = portalGraphql(`
  mutation GrantRoleMutation(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $account: String!
    $role: String!
    $from: String!
  ) {
    IATKSystemAccessManagerGrantRole(
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      address: $address
      from: $from
      input: { role: $role, account: $account }
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for granting a single role to multiple addresses in batch.
 *
 * @remarks
 * BATCH OPTIMIZATION: Reduces transaction overhead when assigning the same role
 * to multiple recipients. Common in scenarios like team onboarding or permission
 * updates across user groups.
 *
 * GAS SCALING: Linear scaling with per-address savings vs individual transactions
 * SECURITY: Single verification covers entire batch operation
 * USE CASE: Team role assignments, bulk permission updates, group access grants
 */
const BATCH_GRANT_ROLE_MUTATION = portalGraphql(`
  mutation BatchGrantRoleMutation(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $role: String!
    $accounts: [String!]!
    $from: String!
  ) {
    IATKSystemAccessManagerBatchGrantRole(
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      address: $address
      from: $from
      input: { role: $role, accounts: $accounts }
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for granting multiple roles to a single address.
 *
 * @remarks
 * ROLE BUNDLING: Enables atomic assignment of multiple roles to prevent intermediate
 * permission states. Critical for roles with dependencies or complex permission sets.
 *
 * ATOMICITY: All roles assigned in single transaction - prevents partial failures
 * SECURITY: Single verification for complete permission set changes
 * USE CASE: Admin promotions, complex role hierarchies, service account setup
 */
const GRANT_MULTIPLE_ROLES_MUTATION = portalGraphql(`
  mutation GrantMultipleRolesMutation(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $account: String!
    $roles: [String!]!
    $from: String!
  ) {
    IATKSystemAccessManagerGrantMultipleRoles(
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      address: $address
      from: $from
      input: { account: $account, roles: $roles }
    ) {
      transactionHash
    }
  }
`);

/**
 * ORPC handler for system role granting with optimized mutation selection.
 *
 * @remarks
 * PERMISSION STRATEGY: Uses blockchain permissions middleware to verify the caller
 * has sufficient privileges before attempting role assignment. This prevents
 * unauthorized role escalation and ensures proper access control hierarchy.
 *
 * MUTATION SELECTION: Automatically selects the most efficient GraphQL mutation
 * based on the input parameters to minimize gas costs and transaction complexity.
 *
 * VERIFICATION INTEGRATION: Delegates wallet verification to Portal middleware
 * which handles different verification types (OTP/PINCODE/SECRET_CODES) transparently.
 *
 * @param input - Role assignment parameters including addresses, roles, and verification
 * @param context - ORPC context with authenticated user and system contracts
 * @param errors - Standardized error constructors for consistent error handling
 * @returns Object containing the processed addresses and roles arrays
 * @throws NOT_FOUND When specified roles don't exist in the system
 * @throws INTERNAL_SERVER_ERROR When system access manager is not available
 * @throws INPUT_VALIDATION_FAILED When attempting unsupported multi-address + multi-role operations
 */
export const grantRole = portalRouter.system.grantRole
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.grantRole,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { walletVerification, address, role } = input;
    const { auth, system } = context;
    const sender = auth.user;

    if (!system?.systemAccessManager) {
      const cause = new Error("System access manager not found");
      throw errors.INTERNAL_SERVER_ERROR({
        message: cause.message,
        cause,
      });
    }

    // INPUT NORMALIZATION: Convert single values to arrays for consistent processing
    // WHY: API accepts both single values and arrays, but internal logic expects arrays
    // This simplifies the mutation selection logic while maintaining API flexibility
    const addresses = Array.isArray(address) ? address : [address];
    const roles = Array.isArray(role) ? role : [role];

    // DUPLICATE ELIMINATION: Remove redundant entries to prevent unnecessary blockchain calls
    // WHY: Users might accidentally specify duplicate addresses or roles
    // Blockchain would reject duplicate role assignments, causing transaction failure
    const uniqueAddresses = [...new Set(addresses)];
    const uniqueRoles = [...new Set(roles)];

    if (uniqueAddresses.length === 0 || uniqueRoles.length === 0) {
      return {
        addresses: [],
        roles: [],
      };
    }

    // ROLE VALIDATION: Verify all roles exist and collect role metadata
    // WHY: Role names from API must be converted to bytes32 values for blockchain
    // Invalid roles would cause transaction reversion, so we validate early
    // PERFORMANCE: Local lookup is much faster than blockchain error discovery
    const invalidRoles: string[] = [];
    const roleInfos = uniqueRoles
      .map((r) => {
        const roleInfo = getRoleByFieldName(r);
        if (!roleInfo) {
          invalidRoles.push(r);
          return null;
        }
        return roleInfo;
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    if (invalidRoles.length > 0) {
      throw errors.NOT_FOUND({
        message: `Roles not found: ${invalidRoles.join(", ")}`,
      });
    }

    // MUTATION SELECTION: Choose optimal GraphQL mutation for gas efficiency
    // WHY: Different mutation patterns have different gas costs and complexity
    // This selection ensures minimal transaction costs for each scenario
    if (uniqueAddresses.length === 1 && uniqueRoles.length === 1) {
      // CASE 1: Single address, single role - Most common and gas-efficient scenario
      const account = uniqueAddresses[0];
      const roleInfo = roleInfos[0];
      // DEFENSIVE PROGRAMMING: These checks should never fail due to length validation above
      // WHY: TypeScript can't prove array access is safe, but we validated lengths
      // This prevents runtime errors in edge cases or future code modifications
      if (!account || !roleInfo) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: "Unexpected error: Invalid address or role configuration",
        });
      }
      await context.portalClient.mutate(
        GRANT_ROLE_MUTATION,
        {
          address: system.systemAccessManager.id,
          from: sender.wallet,
          account,
          role: roleInfo.bytes,
        },
        {
          sender,
          code: walletVerification.secretVerificationCode,
          type: walletVerification.verificationType,
        }
      );
    } else if (uniqueAddresses.length > 1 && uniqueRoles.length === 1) {
      // CASE 2: Multiple addresses, single role - Batch operation for efficiency
      const roleInfo = roleInfos[0];
      // DEFENSIVE PROGRAMMING: This check should never fail due to length validation above
      if (!roleInfo) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: "Unexpected error: Invalid role configuration",
        });
      }
      await context.portalClient.mutate(
        BATCH_GRANT_ROLE_MUTATION,
        {
          address: system.systemAccessManager.id,
          from: sender.wallet,
          accounts: uniqueAddresses,
          role: roleInfo.bytes,
        },
        {
          sender,
          code: walletVerification.secretVerificationCode,
          type: walletVerification.verificationType,
        }
      );
    } else if (uniqueAddresses.length === 1 && uniqueRoles.length > 1) {
      // CASE 3: Single address, multiple roles - Atomic multi-role assignment
      const account = uniqueAddresses[0];
      // DEFENSIVE PROGRAMMING: This check should never fail due to length validation above
      if (!account) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: "Unexpected error: Invalid address configuration",
        });
      }
      const roleBytes = roleInfos.map((r) => r.bytes);
      await context.portalClient.mutate(
        GRANT_MULTIPLE_ROLES_MUTATION,
        {
          address: system.systemAccessManager.id,
          from: sender.wallet,
          account,
          roles: roleBytes,
        },
        {
          sender,
          code: walletVerification.secretVerificationCode,
          type: walletVerification.verificationType,
        }
      );
    } else {
      // CASE 4: Multiple addresses + multiple roles - Explicitly rejected
      // WHY: This would require O(n*m) blockchain operations in a single transaction
      // The gas cost and complexity would be prohibitive and likely to fail
      // SOLUTION: Client should make separate requests for manageable batches
      throw errors.INPUT_VALIDATION_FAILED({
        message:
          "Cannot grant multiple roles to multiple addresses in a single blockchain transaction. Use separate requests for each address or each role.",
        data: {
          errors: [
            "Cannot grant multiple roles to multiple addresses in a single blockchain transaction. Use separate requests for each address or each role.",
          ],
        },
      });
    }

    return {
      addresses: uniqueAddresses,
      roles: uniqueRoles,
    };
  });
