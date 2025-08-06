import { getRoleByFieldName } from "@/lib/constants/roles";
import { portalGraphql } from "@/lib/settlemint/portal";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";

const TOKEN_GRANT_ROLE_MUTATION = portalGraphql(`
  mutation TokenGrantRoleMutation(
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

export const grantRole = tokenRouter.token.grantRole

  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.grantRole,
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { verification, accounts, role } = input;
    const { auth, token, portalClient } = context;
    const sender = auth.user;

    if (!token.accessControl) {
      const cause = new Error("Token access control not found");
      throw errors.INTERNAL_SERVER_ERROR({
        message: cause.message,
        cause,
      });
    }

    if (accounts.length === 0) {
      return {
        accounts: [],
      };
    }

    const roleInfo = getRoleByFieldName(role);
    if (!roleInfo) {
      throw errors.NOT_FOUND({
        message: `Role '${role}' not found`,
      });
    }

    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    const accountsWithoutDuplicates = [...new Set(accounts)];

    // The token access manager address is stored as the accessControl entity ID
    const tokenAccessManagerAddress = token.accessControl?.id;
    if (!tokenAccessManagerAddress) {
      const cause = new Error("Token access manager address not found");
      throw errors.INTERNAL_SERVER_ERROR({
        message: cause.message,
        cause,
      });
    }

    await portalClient.mutate(TOKEN_GRANT_ROLE_MUTATION, {
      address: tokenAccessManagerAddress,
      from: sender.wallet,
      accounts: accountsWithoutDuplicates,
      role: roleInfo.bytes,
      ...challengeResponse,
    });

    return {
      accounts: accountsWithoutDuplicates,
    };
  });
