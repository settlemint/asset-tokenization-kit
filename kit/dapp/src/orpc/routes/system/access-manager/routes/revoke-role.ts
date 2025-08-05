import { getRoleByFieldName } from "@/lib/constants/roles";
import { portalGraphql } from "@/lib/settlemint/portal";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { portalRouter } from "@/orpc/procedures/portal.router";

const REVOKE_ROLE_MUTATION = portalGraphql(`
  mutation RevokeRoleMutation(
    $verificationId: String
    $challengeResponse: String!
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

export const revokeRole = portalRouter.system.revokeRole
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: { any: ["admin"] },
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { verification, accounts, role } = input;
    const { auth, system } = context;
    const sender = auth.user;

    if (!system?.systemAccessManager) {
      const cause = new Error("System access manager not found");
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

    await context.portalClient.mutate(REVOKE_ROLE_MUTATION, {
      address: system.systemAccessManager.id,
      from: sender.wallet,
      accounts: accountsWithoutDuplicates,
      role: roleInfo.bytes,
      ...challengeResponse,
    });

    return {
      accounts: accountsWithoutDuplicates,
    };
  });
