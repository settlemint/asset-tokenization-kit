import { portalGraphql } from "@/lib/settlemint/portal";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";
import { z } from "zod";
import { read } from "../../token.read";

const TOKEN_REDEEM_FOR_MUTATION = portalGraphql(`
  mutation TokenRedeemFor(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $owner: String!
    $amount: String!
  ) {
    redeemFor: ISMARTRedeemableRedeemFor(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        owner: $owner
        amount: $amount
      }
    ) {
      transactionHash
    }
  }
`);

const TOKEN_BALANCE_QUERY = theGraphGraphql(`
  query TokenRedeemBalance($token: Bytes!, $account: Bytes!) {
    tokenBalances(where: { token_: { id: $token }, account_: { id: $account } }, first: 1) {
      valueExact
    }
  }
`);

const TokenBalanceResponseSchema = z.object({
  tokenBalances: z
    .array(
      z.object({
        valueExact: z.string(),
      })
    )
    .default([]),
});

export const redeem = tokenRouter.token.redeem
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.redeem,
      requiredExtensions: ["REDEEMABLE"],
    })
  )
  .handler(async ({ input, context, errors }) => {
    const {
      contract,
      walletVerification,
      amount,
      owner,
      redeemAll = false,
    } = input;
    const { auth } = context;
    if (!context.token) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Token context not initialised",
        data: { errors: ["tokenMiddleware must run before redeem"] },
      });
    }

    const sender = auth.user;
    const ownerAddress = owner ?? sender.wallet;
    const normalizedOwner = ownerAddress.toLowerCase();
    const normalizedCaller = sender.wallet.toLowerCase();

    if (normalizedOwner !== normalizedCaller) {
      const userRoles = context.token.userPermissions?.roles;
      if (!userRoles) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: "Missing token permission context",
          data: { errors: ["Token permissions unavailable"] },
        });
      }

      const canDelegate = userRoles.custodian ?? false;

      if (!canDelegate) {
        throw errors.FORBIDDEN({
          message: "Delegated redemption requires custodian role",
          data: { errors: ["Delegated redemption requires custodian role"] },
        });
      }
    }

    let amountToRedeem: bigint | undefined = undefined;

    if (!redeemAll && amount !== undefined) {
      try {
        amountToRedeem =
          typeof amount === "bigint" ? amount : BigInt(String(amount));
      } catch {
        throw errors.INPUT_VALIDATION_FAILED({
          message: "Invalid amount",
          data: { errors: ["Amount must be an integer string or bigint"] },
        });
      }
    }

    if (redeemAll) {
      if (!context.theGraphClient) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: "theGraphMiddleware should be called before token.redeem",
          data: { errors: ["Missing The Graph client"] },
        });
      }

      const balanceResult = await context.theGraphClient.query(
        TOKEN_BALANCE_QUERY,
        {
          input: {
            token: contract.toLowerCase(),
            account: ownerAddress.toLowerCase(),
          },
          output: TokenBalanceResponseSchema,
        }
      );

      const balanceString = balanceResult.tokenBalances[0]?.valueExact ?? "0";

      amountToRedeem = BigInt(balanceString);
    }

    if (amountToRedeem === undefined) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: "Amount required",
        data: { errors: ["Invalid redeem parameters"] },
      });
    }

    if (amountToRedeem <= 0n) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: "Nothing to redeem",
        data: { errors: ["No redeemable balance found"] },
      });
    }

    await context.portalClient.mutate(
      TOKEN_REDEEM_FOR_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        owner: ownerAddress,
        amount: amountToRedeem.toString(),
      },
      {
        sender,
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
