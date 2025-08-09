import { getRoleByFieldName } from "@/lib/constants/roles";
import { portalGraphql } from "@/lib/settlemint/portal";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import type { AccessControlRoles } from "@/lib/fragments/the-graph/access-control-fragment";
import type { TokenGrantRoleInput } from "@/orpc/routes/token/routes/mutations/access/token.grant-role.schema";

// Single address, single role
const TOKEN_GRANT_ROLE_MUTATION = portalGraphql(`
  mutation TokenGrantRoleMutation(
    $verificationId: String
    $challengeResponse: String!
    $address: String!
    $account: String!
    $role: String!
    $from: String!
  ) {
    ISMARTTokenAccessManagerGrantRole(
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
const TOKEN_BATCH_GRANT_ROLE_MUTATION = portalGraphql(`
  mutation TokenBatchGrantRoleMutation(
    $verificationId: String
    $challengeResponse: String!
    $address: String!
    $role: String!
    $accounts: [String!]!
    $from: String!
  ) {
    ISMARTTokenAccessManagerBatchGrantRole(
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
const TOKEN_GRANT_MULTIPLE_ROLES_MUTATION = portalGraphql(`
  mutation TokenGrantMultipleRolesMutation(
    $verificationId: String
    $challengeResponse: String!
    $address: String!
    $account: String!
    $roles: [String!]!
    $from: String!
  ) {
    ISMARTTokenAccessManagerGrantMultipleRoles(
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

export const grantRole = tokenRouter.token.grantRole

  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.grantRole,
    })
  )
  .handler(async ({ input, context, errors }) => {
    const typedInput = input;
    const { verification } = typedInput;
    const { auth, token, portalClient } = context;
    const sender = auth.user;

    if (!token.accessControl) {
      const cause = new Error("Token access control not found");
      throw errors.INTERNAL_SERVER_ERROR({
        message: cause.message,
        cause,
      });
    }

    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });
    // The token access manager address is stored as the accessControl entity ID
    const tokenAccessManagerAddress = token.accessControl?.id;
    if (!tokenAccessManagerAddress) {
      const cause = new Error("Token access manager address not found");
      throw errors.INTERNAL_SERVER_ERROR({
        message: cause.message,
        cause,
      });
    }

    // Branch based on input shape
    const hasKeys = (obj: unknown, keys: Array<string>): obj is Record<string, unknown> =>
      typeof obj === "object" && obj !== null && keys.every((k) => k in obj);

    const isManyAccounts = (
      i: TokenGrantRoleInput
    ): i is Extract<
      TokenGrantRoleInput,
      { accounts: string[]; role: AccessControlRoles }
    > => hasKeys(i, ["accounts", "role"]);

    const isOneAccountManyRoles = (
      i: TokenGrantRoleInput
    ): i is Extract<
      TokenGrantRoleInput,
      { address: string; roles: AccessControlRoles[] }
    > => hasKeys(i, ["address", "roles"]);

    if (isManyAccounts(typedInput)) {
      const { accounts, role } = typedInput;
      if (!Array.isArray(accounts) || accounts.length === 0) {
        return { accounts: [] };
      }
      const roleInfo = getRoleByFieldName(role as AccessControlRoles);
      if (!roleInfo) {
        throw errors.NOT_FOUND({ message: `Role '${role}' not found` });
      }
      const accountsWithoutDuplicates = [...new Set(accounts)];
      if (accountsWithoutDuplicates.length === 1) {
        const account = accountsWithoutDuplicates[0];
        if (!account) {
          throw errors.INTERNAL_SERVER_ERROR({ message: "Invalid account" });
        }
        await portalClient.mutate(TOKEN_GRANT_ROLE_MUTATION, {
          address: tokenAccessManagerAddress,
          from: sender.wallet,
          account,
          role: roleInfo.bytes,
          ...challengeResponse,
        });
      } else {
        await portalClient.mutate(TOKEN_BATCH_GRANT_ROLE_MUTATION, {
          address: tokenAccessManagerAddress,
          from: sender.wallet,
          accounts: accountsWithoutDuplicates,
          role: roleInfo.bytes,
          ...challengeResponse,
        });
      }
      return { accounts: accountsWithoutDuplicates };
    }

    if (isOneAccountManyRoles(typedInput)) {
      const { address, roles } = typedInput;
      if (!Array.isArray(roles) || roles.length === 0) {
        return { accounts: [] };
      }
      const roleInfos = roles
        .map((r) => getRoleByFieldName(r as AccessControlRoles))
        .filter(Boolean);
      if (roleInfos.length !== roles.length) {
        throw errors.NOT_FOUND({ message: "One or more roles not found" });
      }
      if (roleInfos.length === 1) {
        const single = roleInfos[0];
        if (!single) {
          throw errors.INTERNAL_SERVER_ERROR({ message: "Invalid role configuration" });
        }
        await portalClient.mutate(TOKEN_GRANT_ROLE_MUTATION, {
          address: tokenAccessManagerAddress,
          from: sender.wallet,
          account: address,
          role: single.bytes,
          ...challengeResponse,
        });
      } else {
        const rolesBytes = roleInfos.reduce<string[]>((acc, ri) => {
          // ri may be undefined in type inference; guard explicitly
          if (ri) acc.push(ri.bytes);
          return acc;
        }, []);
        await portalClient.mutate(TOKEN_GRANT_MULTIPLE_ROLES_MUTATION, {
          address: tokenAccessManagerAddress,
          from: sender.wallet,
          account: address,
          roles: rolesBytes,
          ...challengeResponse,
        });
      }
      return { accounts: [address] };
    }

    // Should be unreachable due to schema, but safe-guard
    throw errors.INPUT_VALIDATION_FAILED({
      message: "Invalid grant role input shape",
      data: { errors: ["Invalid grant role input shape"] },
    });
  });
