import { portalGraphql } from "@/lib/settlemint/portal";
import { validateBatchArrays } from "@/orpc/helpers/array-validation";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";
import { read } from "../../token.read";

const TOKEN_SINGLE_BURN_MUTATION = portalGraphql(`
  mutation TokenBurn(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $userAddress: String!
    $amount: String!
  ) {
    burn: IERC3643Burn(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        _userAddress: $userAddress
        _amount: $amount
      }
    ) {
      transactionHash
    }
  }
`);

const TOKEN_BATCH_BURN_MUTATION = portalGraphql(`
  mutation TokenBatchBurn(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $userAddresses: [String!]!
    $amounts: [String!]!
  ) {
    batchBurn: ISMARTBurnableBatchBurn(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        userAddresses: $userAddresses
        amounts: $amounts
      }
    ) {
      transactionHash
    }
  }
`);

export const burn = tokenRouter.token.burn
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.burn,
      requiredExtensions: ["BURNABLE"],
    })
  )

  .handler(async ({ input, context, errors }) => {
    const { contract, verification, addresses, amounts } = input;
    const { auth } = context;

    // Determine if this is a batch operation
    const isBatch = addresses.length > 1;

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    // Execute the burn operation
    if (isBatch) {
      // Validate batch arrays
      validateBatchArrays(
        {
          addresses,
          amounts,
        },
        "batch burn"
      );

      await context.portalClient.mutate(TOKEN_BATCH_BURN_MUTATION, {
        address: contract,
        from: sender.wallet,
        userAddresses: addresses,
        amounts: amounts.map((a) => a.toString()),
        ...challengeResponse,
      });
    } else {
      const [userAddress] = addresses;
      const [amount] = amounts;
      if (!userAddress || !amount) {
        throw errors.INPUT_VALIDATION_FAILED({
          message: "Missing address or amount",
          data: { errors: ["Invalid input data"] },
        });
      }
      await context.portalClient.mutate(TOKEN_SINGLE_BURN_MUTATION, {
        address: contract,
        from: sender.wallet,
        userAddress,
        amount: amount.toString(),
        ...challengeResponse,
      });
    }

    // Return the updated token data using the read handler
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
