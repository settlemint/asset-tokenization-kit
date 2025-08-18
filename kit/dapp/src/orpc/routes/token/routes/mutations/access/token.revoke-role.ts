import { getRoleByFieldName } from "@/lib/constants/roles";
import { portalGraphql } from "@/lib/settlemint/portal";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
// type import not needed here

// Single address, single role
const REVOKE_ROLE_MUTATION = portalGraphql(`
  mutation TokenRevokeRoleMutation(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $account: String!
    $role: String!
    $from: String!
  ) {
    ISMARTTokenAccessManagerRevokeRole(
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

// Multiple addresses, single role
const BATCH_REVOKE_ROLE_MUTATION = portalGraphql(`
  mutation TokenBatchRevokeRoleMutation(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $role: String!
    $accounts: [String!]!
    $from: String!
  ) {
    ISMARTTokenAccessManagerBatchRevokeRole(
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

// Single address, multiple roles
const REVOKE_MULTIPLE_ROLES_MUTATION = portalGraphql(`
  mutation TokenRevokeMultipleRolesMutation(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $account: String!
    $roles: [String!]!
    $from: String!
  ) {
    ISMARTTokenAccessManagerRevokeMultipleRoles(
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

export const revokeRole = tokenRouter.token.revokeRole
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.grantRole, // admin can grant/revoke
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { walletVerification, address, role } = input;

    const { auth, token, portalClient } = context;
    const sender = auth.user;

    if (!token.accessControl?.id) {
      const cause = new Error("Token access manager address not found");
      throw errors.INTERNAL_SERVER_ERROR({ message: cause.message, cause });
    }

    // Normalize inputs
    const addresses = (Array.isArray(address) ? address : [address]).filter(
      Boolean
    ) as string[];
    const roles = (Array.isArray(role) ? role : [role]).filter(Boolean);

    const uniqueAddresses = [...new Set(addresses)];
    const uniqueRoles = [...new Set(roles)];

    if (uniqueAddresses.length === 0 || uniqueRoles.length === 0) {
      return { addresses: [], roles: [] };
    }

    // Validate roles
    const invalidRoles: string[] = [];
    const roleInfos = uniqueRoles
      .map((r) => {
        const info = getRoleByFieldName(r);
        if (!info) {
          invalidRoles.push(r);
          return null;
        }
        return info;
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    if (invalidRoles.length > 0) {
      throw errors.NOT_FOUND({
        message: `Roles not found: ${invalidRoles.join(", ")}`,
      });
    }

    const accessManagerAddress = token.accessControl.id;

    if (uniqueAddresses.length === 1 && uniqueRoles.length === 1) {
      const account = uniqueAddresses[0];
      const info = roleInfos[0];
      if (!account || !info) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: "Invalid address or role",
        });
      }
      await portalClient.mutate(
        REVOKE_ROLE_MUTATION,
        {
          address: accessManagerAddress,
          from: sender.wallet,
          account,
          role: info.bytes,
        },
        {
          sender: sender,
          code: walletVerification.secretVerificationCode,
          type: walletVerification.verificationType,
        }
      );
    } else if (uniqueAddresses.length > 1 && uniqueRoles.length === 1) {
      const info = roleInfos[0];
      if (!info) {
        throw errors.INTERNAL_SERVER_ERROR({ message: "Invalid role" });
      }
      await portalClient.mutate(
        BATCH_REVOKE_ROLE_MUTATION,
        {
          address: accessManagerAddress,
          from: sender.wallet,
          accounts: uniqueAddresses,
          role: info.bytes,
        },
        {
          sender: sender,
          code: walletVerification.secretVerificationCode,
          type: walletVerification.verificationType,
        }
      );
    } else if (uniqueAddresses.length === 1 && uniqueRoles.length > 1) {
      const account = uniqueAddresses[0];
      if (!account) {
        throw errors.INTERNAL_SERVER_ERROR({ message: "Invalid address" });
      }
      await portalClient.mutate(
        REVOKE_MULTIPLE_ROLES_MUTATION,
        {
          address: accessManagerAddress,
          from: sender.wallet,
          account,
          roles: roleInfos.map((r) => r.bytes),
        },
        {
          sender: sender,
          code: walletVerification.secretVerificationCode,
          type: walletVerification.verificationType,
        }
      );
    } else {
      throw errors.INPUT_VALIDATION_FAILED({
        message:
          "Cannot revoke multiple roles from multiple addresses in a single transaction.",
        data: {
          errors: [
            "Cannot revoke multiple roles from multiple addresses in a single transaction.",
          ],
        },
      });
    }

    return { addresses: uniqueAddresses, roles: uniqueRoles };
  });
