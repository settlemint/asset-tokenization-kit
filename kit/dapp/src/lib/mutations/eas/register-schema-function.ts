import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { EAS_REGISTRY_ADDRESS } from "@/lib/contracts";
import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { RegisterSchemaInput } from "./register-schema-schema";

const assetPriceSchema = `address Asset,uint256 Price,string Currency`;

const RegisterSchema = portalGraphql(`
  mutation RegisterSchema(
    $resolver: String!
    $revocable: Boolean!
    $schema: String!
    $address: String!
    $challengeResponse: String!
    $from: String!
  ) {
    EASSchemaRegistryRegister(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      input: {
        resolver: $resolver,
        revocable: $revocable,
        schema: $schema
      }
    ) {
      transactionHash
    }
  }
`);

export const registerSchemasFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["manage"],
    },
  },
  async ({
    parsedInput: { verificationCode, verificationType },
    ctx: { user },
  }: {
    parsedInput: RegisterSchemaInput;
    ctx: { user: User };
  }) => {
    // TODO: check if it is already registered, needs a new deployment

    const registerAssetPriceSchema = await portalClient.request(
      RegisterSchema,
      {
        address: EAS_REGISTRY_ADDRESS,
        from: user.wallet,
        schema: assetPriceSchema,
        revocable: false,
        resolver: "0x0000000000000000000000000000000000000000",
        ...(await handleChallenge(
          user,
          user.wallet,
          verificationCode,
          verificationType
        )),
      }
    );

    const registerAssetPriceSchemaTxHash =
      registerAssetPriceSchema.EASSchemaRegistryRegister?.transactionHash;
    if (!registerAssetPriceSchemaTxHash) {
      throw new Error("Failed to create equity: no transaction hash received");
    }

    const allTransactionHashes = [registerAssetPriceSchemaTxHash];

    // Wait for the equity creation transaction to be mined
    await waitForTransactions(allTransactionHashes);

    return safeParse(t.Hashes(), allTransactionHashes);
  }
);
