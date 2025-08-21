/**
 * Deploy identity contract for existing token
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { z } from "zod";

/**
 * GraphQL mutation for creating contract identity
 */
const CREATE_CONTRACT_IDENTITY_MUTATION = portalGraphql(`
  mutation CreateContractIdentity(
    $factory: String!
    $contract: String!
    $from: String!
    $challengeId: String
    $challengeResponse: String
  ) {
    createIdentity: ATKIdentityFactoryImplementationCreateContractIdentity(
      address: $factory
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        _contract: $contract
      }
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for setting onchainID
 */
const SET_ONCHAIN_ID_MUTATION = portalGraphql(`
  mutation SetOnchainID(
    $token: String!
    $identity: String!
    $from: String!
    $challengeId: String
    $challengeResponse: String
  ) {
    setOnchainID: ATKStableCoinImplementationSetOnchainID(
      address: $token
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        _onchainID: $identity
      }
    ) {
      transactionHash
    }
  }
`);

/**
 * Input schema for deploy identity
 */
const deployIdentityInputSchema = z.object({
  contract: z.string(),
  walletVerification: z.object({
    secretVerificationCode: z.string(),
    verificationType: z.enum(["OTP", "PINCODE", "SECRET_CODES"]),
  }),
});

/**
 * ORPC handler for deploying identity contract
 */
export const deployIdentity = tokenRouter.token.deployIdentity
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.updateCollateral, // Uses governance role
    })
  )
  .handler(async ({ input, context }) => {
    const { contract, walletVerification } = input;
    const { auth } = context;

    const sender = auth.user;

    try {
      // Step 1: Get system addresses from environment or hardcode
      // This should be updated with actual system addresses
      const IDENTITY_FACTORY = "0x5e771e1417100000000000000000000000020005"; // Update with actual address

      console.log("Creating identity for token:", contract);

      // Step 2: Create contract identity
      const createResult = await context.portalClient.mutate(
        CREATE_CONTRACT_IDENTITY_MUTATION,
        {
          factory: IDENTITY_FACTORY,
          contract: contract,
          from: sender.wallet,
        },
        {
          sender: sender,
          code: walletVerification.secretVerificationCode,
          type: walletVerification.verificationType,
        }
      );

      console.log("Identity creation tx:", createResult);

      // Step 3: Get the identity address (would need to parse from events)
      // For now, we'll need to get it from the factory
      // This is a simplified version - in production you'd parse the event logs

      // Step 4: Set onchainID on the token
      // const setResult = await context.portalClient.mutate(
      //   SET_ONCHAIN_ID_MUTATION,
      //   {
      //     token: contract,
      //     identity: identityAddress,
      //     from: sender.wallet,
      //   },
      //   {
      //     sender: sender,
      //     code: walletVerification.secretVerificationCode,
      //     type: walletVerification.verificationType,
      //   }
      // );

      return {
        success: true,
        message:
          "Identity contract deployed. Please check transaction logs for the identity address.",
        transactionHash: createResult,
      };
    } catch (error) {
      console.error("Failed to deploy identity:", error);
      throw new Error(
        `Failed to deploy identity: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });
