import { getRoleByFieldName } from "@/lib/constants/roles";
import { portalGraphql } from "@/lib/settlemint/portal";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { portalRouter } from "@/orpc/procedures/portal.router";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";

// Single address, single role
const GRANT_ROLE_MUTATION = portalGraphql(`
  mutation GrantRoleMutation(
    $verificationId: String
    $challengeResponse: String!
    $address: String!
    $account: String!
    $role: String!
    $from: String!
  ) {
    IATKSystemAccessManagerGrantRole(
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
const BATCH_GRANT_ROLE_MUTATION = portalGraphql(`
  mutation BatchGrantRoleMutation(
    $verificationId: String
    $challengeResponse: String!
    $address: String!
    $role: String!
    $accounts: [String!]!
    $from: String!
  ) {
    IATKSystemAccessManagerBatchGrantRole(
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
const GRANT_MULTIPLE_ROLES_MUTATION = portalGraphql(`
  mutation GrantMultipleRolesMutation(
    $verificationId: String
    $challengeResponse: String!
    $address: String!
    $account: String!
    $roles: [String!]!
    $from: String!
  ) {
    IATKSystemAccessManagerGrantMultipleRoles(
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
    const { verification, address, role } = input;
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

    // Validate all roles exist
    const roleInfos = uniqueRoles.map((r) => {
      const roleInfo = getRoleByFieldName(r);
      if (!roleInfo) {
        throw errors.NOT_FOUND({
          message: `Role '${r}' not found`,
        });
      }
      return roleInfo;
    });

    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    // Execute the appropriate mutation based on the use case
    if (uniqueAddresses.length === 1 && uniqueRoles.length === 1) {
      // Single address, single role - use grantRole
      const account = uniqueAddresses[0];
      const roleInfo = roleInfos[0];
      if (!account || !roleInfo) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: "Invalid address or role configuration",
        });
      }
      await context.portalClient.mutate(GRANT_ROLE_MUTATION, {
        address: system.systemAccessManager.id,
        from: sender.wallet,
        account,
        role: roleInfo.bytes,
        ...challengeResponse,
      });
    } else if (uniqueAddresses.length > 1 && uniqueRoles.length === 1) {
      // Multiple addresses, single role - use batchGrantRole
      const roleInfo = roleInfos[0];
      if (!roleInfo) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: "Invalid role configuration",
        });
      }
      await context.portalClient.mutate(BATCH_GRANT_ROLE_MUTATION, {
        address: system.systemAccessManager.id,
        from: sender.wallet,
        accounts: uniqueAddresses,
        role: roleInfo.bytes,
        ...challengeResponse,
      });
    } else if (uniqueAddresses.length === 1 && uniqueRoles.length > 1) {
      // Single address, multiple roles - use grantMultipleRoles
      const account = uniqueAddresses[0];
      if (!account) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: "Invalid address configuration",
        });
      }
      const roleBytes = roleInfos.map((r) => r.bytes);
      await context.portalClient.mutate(GRANT_MULTIPLE_ROLES_MUTATION, {
        address: system.systemAccessManager.id,
        from: sender.wallet,
        account,
        roles: roleBytes,
        ...challengeResponse,
      });
    } else {
      // Multiple addresses, multiple roles - not supported in a single transaction
      throw errors.INPUT_VALIDATION_FAILED({
        message:
          "Cannot grant multiple roles to multiple addresses in a single transaction. Please use separate requests.",
        data: {
          errors: [
            "Cannot grant multiple roles to multiple addresses in a single transaction. Please use separate requests.",
          ],
        },
      });
    }

    return {
      addresses: uniqueAddresses,
      roles: uniqueRoles,
    };
  });
