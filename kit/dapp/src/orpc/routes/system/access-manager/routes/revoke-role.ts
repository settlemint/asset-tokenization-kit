import { getRoleByFieldName } from "@/lib/constants/roles";
import { portalGraphql } from "@/lib/settlemint/portal";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { portalRouter } from "@/orpc/procedures/portal.router";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";

// Single address, single role
const REVOKE_ROLE_MUTATION = portalGraphql(`
  mutation RevokeRoleMutation(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $account: String!
    $role: String!
    $from: String!
  ) {
    IATKSystemAccessManagerRevokeRole(
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      address: $address
      from: $from
      input: { role: $role, account: $account }
    ) {
      transactionHash
    }
  }
`);

// Multiple addresses, single role
const BATCH_REVOKE_ROLE_MUTATION = portalGraphql(`
  mutation BatchRevokeRoleMutation(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $role: String!
    $accounts: [String!]!
    $from: String!
  ) {
    IATKSystemAccessManagerBatchRevokeRole(
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      address: $address
      from: $from
      input: { role: $role, accounts: $accounts }
    ) {
      transactionHash
    }
  }
`);

// Single address, multiple roles
const REVOKE_MULTIPLE_ROLES_MUTATION = portalGraphql(`
  mutation RevokeMultipleRolesMutation(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $account: String!
    $roles: [String!]!
    $from: String!
  ) {
    IATKSystemAccessManagerRevokeMultipleRoles(
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      address: $address
      from: $from
      input: { account: $account, roles: $roles }
    ) {
      transactionHash
    }
  }
`);

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

    // Normalize inputs to arrays
    const addresses = Array.isArray(address) ? address : [address];
    const roles = Array.isArray(role) ? role : [role];

    // Remove duplicates
    const uniqueAddresses = [...new Set(addresses)];
    const uniqueRoles = [...new Set(roles)];

    if (uniqueAddresses.length === 0 || uniqueRoles.length === 0) {
      return {
        addresses: [],
        roles: [],
      };
    }

    // Validate all roles exist and collect all invalid roles
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

    // Execute the appropriate mutation based on the use case
    if (uniqueAddresses.length === 1 && uniqueRoles.length === 1) {
      // Single address, single role - use revokeRole
      const account = uniqueAddresses[0];
      const roleInfo = roleInfos[0];
      // These checks should never fail due to length validation above
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
      // Multiple addresses, single role - use batchRevokeRole
      const roleInfo = roleInfos[0];
      // This check should never fail due to length validation above
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
      // Single address, multiple roles - use revokeMultipleRoles
      const account = uniqueAddresses[0];
      // This check should never fail due to length validation above
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
      // Multiple addresses, multiple roles - not supported in a single transaction
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
