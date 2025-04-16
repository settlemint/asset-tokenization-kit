import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { EAS_ADDRESS } from "@/lib/contracts";
import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { getSchemaUID } from "@/lib/utils/eas/get-schema-uid";
import { safeParse, t } from "@/lib/utils/typebox";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import type { AttestPriceInput } from "./attest-price-schema";
import {
  assetPriceSchema,
  assetPriceSchemaResolver,
  assetPriceSchemaRevocable,
} from "./schemas/asset-price";

const AttestPrice = portalGraphql(`
  mutation AttestPrice(
    $address: String!
    $challengeResponse: String!
    $from: String!
    $data: String!
    $expirationTime: String!
    $recipient: String!
    $revocable: Boolean!
    $refUID: String!
    $value: String!
    $schema: String!
  ) {
    EASAttest(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      input: {
        request: {
          data: {
            data: $data,
            expirationTime: $expirationTime,
            recipient: $recipient,
            revocable: $revocable,
            value: $value,
            refUID: $refUID
          },
          schema: $schema
        }
      }
    ) {
      transactionHash
    }
  }
`);

export const attestPriceFunction = withAccessControl(
  {
    requiredPermissions: {},
  },
  async ({
    parsedInput,
    ctx: { user },
  }: {
    parsedInput: AttestPriceInput;
    ctx: { user: User };
  }) => {
    const { verificationCode, verificationType, ...attestationData } =
      parsedInput;

    const schemaUID = getSchemaUID(
      assetPriceSchema,
      assetPriceSchemaResolver,
      assetPriceSchemaRevocable
    );

    const schemaEncoder = new SchemaEncoder(assetPriceSchema);
    const encodedData = schemaEncoder.encodeData([
      { name: "asset", value: attestationData.asset, type: "address" },
      { name: "price", value: attestationData.price, type: "uint256" },
      { name: "currency", value: attestationData.currency, type: "string" },
    ]);

    const attestResult = await portalClient.request(AttestPrice, {
      address: EAS_ADDRESS,
      from: user.wallet,
      schema: schemaUID,
      value: "0",
      data: encodedData,
      refUID: "",
      recipient: attestationData.asset,
      revocable: false,
      expirationTime: "",
      ...(await handleChallenge(
        user,
        user.wallet, // Assuming the 'from' address is the user's wallet
        verificationCode,
        verificationType
      )),
    });

    const txHash = attestResult.EASAttest?.transactionHash;
    if (!txHash) {
      throw new Error(
        "Failed to create attestation: no transaction hash received"
      );
    }

    // Wait for the transaction to be mined
    await waitForTransactions([txHash]);

    // Assuming we want to return the transaction hash
    return safeParse(t.Hashes(), [txHash]);
  }
);
