import { portalGraphql } from "@/lib/settlemint/portal";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { call } from "@orpc/server";
import * as z from "zod";
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

const TOKEN_BALANCE_QUERY = portalGraphql(`
  query TokenRedeemBalance($address: String!, $owner: String!) {
    IERC20(address: $address) {
      balanceOf(account_: $owner) {
        value
      }
    }
  }
`);

const TokenBalanceResponseSchema = z.object({
  IERC20: z.object({
    balanceOf: z.union([
      z.string(),
      z.object({
        value: z.string(),
      }),
      z.object({
        balance: z.string(),
      }),
    ]),
  }),
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

    const sender = auth.user;
    const ownerAddress = owner ?? sender.wallet;
    const normalizedOwner = ownerAddress.toLowerCase();
    const normalizedCaller = sender.wallet.toLowerCase();

    if (normalizedOwner !== normalizedCaller) {
      const userRoles = context.token.userPermissions.roles;
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
      const balanceResult = await context.portalClient.query(
        TOKEN_BALANCE_QUERY,
        {
          address: contract,
          owner: ownerAddress,
        },
        TokenBalanceResponseSchema
      );

      const balanceField = balanceResult.IERC20.balanceOf;
      const balanceString =
        typeof balanceField === "string"
          ? balanceField
          : "value" in balanceField
            ? balanceField.value
            : "balance" in balanceField
              ? balanceField.balance
              : "0";

      amountToRedeem = BigInt(balanceString);
    }

    if (amountToRedeem === undefined) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: "Amount required",
        data: { errors: ["Invalid redeem parameters"] },
      });
    }

    if ((amountToRedeem as bigint) <= 0n) {
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
