/**
 * Bond maturity handler - marks bonds as matured after validating conditions.
 * Requires governance role, maturity date reached, and sufficient denomination assets.
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { statsBondStatus } from "@/orpc/routes/token/routes/stats/bond-status";
import { read } from "@/orpc/routes/token/routes/token.read";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";
import { format, lessThan } from "dnum";

/**
 * GraphQL mutation to mature a bond token.
 */
const TOKEN_MATURE_MUTATION = portalGraphql(`
  mutation TokenMature(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
  ) {
    mature: ATKBondImplementationMature(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Matures a bond token after validating governance permissions and maturity conditions.
 */
export const mature = tokenRouter.token.mature
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.mature,
      requiredExtensions: ["BOND"],
    })
  )
  .handler(async ({ input, context, errors }) => {
    const { contract, walletVerification } = input;
    const { auth, token } = context;

    if (!token.bond) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: "Token is not a bond",
        data: { errors: ["Only bond tokens can be matured"] },
      });
    }

    if (token.bond.isMatured) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: "Bond is already matured",
        data: { errors: ["This bond has already been matured"] },
      });
    }

    const bondStatus = await call(
      statsBondStatus,
      {
        tokenAddress: contract,
      },
      {
        context,
      }
    );

    const denominationAssetAmount =
      bondStatus.denominationAssetBalanceAvailable;
    const requiredAmount = bondStatus.denominationAssetBalanceRequired;

    if (lessThan(denominationAssetAmount, requiredAmount)) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: "Insufficient denomination asset balance",
        data: {
          errors: [
            `Bond contract needs ${format(requiredAmount)} denomination assets but only has ${format(denominationAssetAmount)}`,
          ],
        },
      });
    }

    const sender = auth.user;
    await context.portalClient.mutate(
      TOKEN_MATURE_MUTATION,
      {
        address: contract,
        from: sender.wallet,
      },
      {
        sender: sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

    return await call(
      read,
      {
        tokenAddress: contract,
      },
      {
        context,
      }
    );
  });
