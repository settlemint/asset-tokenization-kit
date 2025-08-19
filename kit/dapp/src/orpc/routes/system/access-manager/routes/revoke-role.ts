/**
 * System Access Manager Role Revocation Operations
 *
 * @fileoverview
 * Implements secure role revocation operations for the Asset Tokenization Kit's access control system.
 * Mirror counterpart to grant-role.ts with identical optimization strategies but for permission removal.
 * Provides gas-efficient mutations for different role revocation scenarios.
 *
 * @remarks
 * ARCHITECTURAL DECISIONS:
 * - Three distinct mutation types optimize gas costs for different revocation scenarios
 * - Single address + single role: Most common scenario for individual permission removal
 * - Multiple addresses + single role: Batch operation for role revocation across users
 * - Single address + multiple roles: Atomic multi-role revocation prevents partial states
 * - Multiple addresses + multiple roles: Rejected to prevent transaction complexity explosion
 *
 * SECURITY BOUNDARIES:
 * - All operations require wallet verification (OTP/PINCODE/SECRET_CODES)
 * - Permission validation ensures caller has authority to revoke roles
 * - Role validation prevents revocation attempts on non-existent roles
 * - System access manager validation ensures proper contract context
 *
 * REVOCATION SAFETY:
 * - Atomic operations prevent partial permission removal failures
 * - Batch operations maintain consistency across multiple addresses
 * - Invalid role attempts fail fast without blockchain interaction
 * - Self-revocation protection handled by smart contract logic
 *
 * @see {@link blockchainPermissionsMiddleware} Permission validation for revocation authority
 * @see {@link getRoleByFieldName} Role validation and byte conversion utilities
 */

import { getRoleByFieldName } from "@/lib/constants/roles";
import { portalGraphql } from "@/lib/settlemint/portal";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { portalRouter } from "@/orpc/procedures/portal.router";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";

/**
 * GraphQL mutation for revoking a single role from a single address.
 *
 * @remarks
 * OPTIMIZATION: Most gas-efficient pattern for individual role revocation.
 * Used for demotions, access corrections, or individual permission adjustments.
 *
 * GAS EFFICIENCY: ~50k gas vs ~80k+ for batch operations with single items
 * SECURITY: Requires wallet verification to prevent unauthorized revocations
 * USE CASE: Individual demotions, access corrections, emergency role removals
 */
const REVOKE_ROLE_MUTATION = portalGraphql(`
  mutation RevokeRoleMutation(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $account: String!
    $role: String!
    $from: String!
  ) {
    IATKSystemAccessManagerRevokeRole(
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
 * GraphQL mutation for revoking a single role from multiple addresses in batch.
 *
 * @remarks
 * BATCH EFFICIENCY: Optimizes gas costs when removing the same role from multiple
 * users simultaneously. Common in team restructuring or bulk access adjustments.
 *
 * GAS SCALING: Linear scaling with per-address savings vs individual transactions
 * ATOMICITY: All revocations succeed or fail together, preventing partial states
 * USE CASE: Team restructuring, bulk permission downgrades, project conclusion cleanup
 */
const BATCH_REVOKE_ROLE_MUTATION = portalGraphql(`
  mutation BatchRevokeRoleMutation(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $role: String!
    $accounts: [String!]!
    $from: String!
  ) {
    IATKSystemAccessManagerBatchRevokeRole(
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
 * GraphQL mutation for revoking multiple roles from a single address.
 *
 * @remarks
 * ATOMIC REVOCATION: Ensures all roles are removed simultaneously to prevent
 * intermediate permission states that could be exploited or cause inconsistencies.
 *
 * CONSISTENCY: Prevents partial permission removal that could leave user in invalid state
 * SECURITY: Single verification for complete permission set changes
 * USE CASE: Employee departures, major role changes, security incident response
 */
const REVOKE_MULTIPLE_ROLES_MUTATION = portalGraphql(`
  mutation RevokeMultipleRolesMutation(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $account: String!
    $roles: [String!]!
    $from: String!
  ) {
    IATKSystemAccessManagerRevokeMultipleRoles(
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
 * ORPC handler for system role revocation with optimized mutation selection.
 *
 * @remarks
 * REVOCATION AUTHORITY: Uses blockchain permissions middleware to verify the caller
 * has sufficient privileges to revoke roles. Prevents unauthorized privilege escalation
 * through role removal and ensures proper access control hierarchy.
 *
 * MUTATION OPTIMIZATION: Automatically selects the most gas-efficient GraphQL mutation
 * based on input parameters. Mirrors grant-role.ts optimization strategy for consistency.
 *
 * SAFETY GUARANTEES: All revocations are atomic - either complete successfully or
 * fail entirely. This prevents partial permission states that could compromise security.
 *
 * @param input - Role revocation parameters including addresses, roles, and verification
 * @param context - ORPC context with authenticated user and system contracts
 * @param errors - Standardized error constructors for consistent error handling
 * @returns Object containing the processed addresses and roles arrays
 * @throws NOT_FOUND When specified roles don't exist in the system
 * @throws INTERNAL_SERVER_ERROR When system access manager is not available
 * @throws INPUT_VALIDATION_FAILED When attempting unsupported multi-address + multi-role operations
 */
export const revokeRole = portalRouter.system.revokeRole
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.revokeRole,
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
    // WHY: API accepts both single values and arrays, maintaining consistency with grant-role.ts
    // This simplifies mutation selection logic while maintaining API flexibility
    const addresses = Array.isArray(address) ? address : [address];
    const roles = Array.isArray(role) ? role : [role];

    // DUPLICATE ELIMINATION: Remove redundant entries to prevent unnecessary blockchain calls
    // WHY: Duplicate revocations would cause transaction failures or waste gas
    // Smart contract would reject redundant revocation attempts
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
    // Invalid roles would cause transaction reversion with cryptic error messages
    // PERFORMANCE: Local validation much faster than blockchain error discovery
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
    // Selection mirrors grant-role.ts for consistent performance characteristics
    if (uniqueAddresses.length === 1 && uniqueRoles.length === 1) {
      // CASE 1: Single address, single role - Most common revocation scenario
      const account = uniqueAddresses[0];
      const roleInfo = roleInfos[0];
      // DEFENSIVE PROGRAMMING: These checks should never fail due to length validation above
      // WHY: TypeScript can't prove array access is safe, but we validated lengths
      // Prevents runtime errors and provides clear error messages for debugging
      if (!account || !roleInfo) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: "Unexpected error: Invalid address or role configuration",
        });
      }
      await context.portalClient.mutate(
        REVOKE_ROLE_MUTATION,
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
      // CASE 2: Multiple addresses, single role - Batch revocation for efficiency
      const roleInfo = roleInfos[0];
      // DEFENSIVE PROGRAMMING: This check should never fail due to length validation above
      if (!roleInfo) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: "Unexpected error: Invalid role configuration",
        });
      }
      await context.portalClient.mutate(
        BATCH_REVOKE_ROLE_MUTATION,
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
      // CASE 3: Single address, multiple roles - Atomic multi-role revocation
      const account = uniqueAddresses[0];
      // DEFENSIVE PROGRAMMING: This check should never fail due to length validation above
      if (!account) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: "Unexpected error: Invalid address configuration",
        });
      }
      const roleBytes = roleInfos.map((r) => r.bytes);
      await context.portalClient.mutate(
        REVOKE_MULTIPLE_ROLES_MUTATION,
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
      // WHY: This would require O(n*m) blockchain operations with prohibitive gas costs
      // Transaction would likely exceed block gas limit and fail
      // SOLUTION: Client should decompose into manageable single-dimension operations
      throw errors.INPUT_VALIDATION_FAILED({
        message:
          "Cannot revoke multiple roles from multiple addresses in a single blockchain transaction. Use separate requests for each address or each role.",
        data: {
          errors: [
            "Cannot revoke multiple roles from multiple addresses in a single blockchain transaction. Use separate requests for each address or each role.",
          ],
        },
      });
    }

    return {
      addresses: uniqueAddresses,
      roles: uniqueRoles,
    };
  });
