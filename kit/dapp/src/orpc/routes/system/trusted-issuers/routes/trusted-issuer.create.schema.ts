import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";
import { MutationInputSchema } from "@/orpc/routes/common/schemas/mutation.schema";

/**
 * Input schema for creating a trusted issuer
 */
export const TrustedIssuerCreateInputSchema = MutationInputSchema.extend({
  issuerAddress: ethereumAddress.describe(
    "The identity address of the trusted issuer to create"
  ),
  claimTopicIds: z
    .array(z.string())
    .min(1)
    .describe("Array of topic IDs this issuer can verify"),
});

/**
 * Output schema for creating a trusted issuer
 */
export const TrustedIssuerCreateOutputSchema = z.object({
  transactionHash: z
    .string()
    .describe("Transaction hash of the create operation"),
  issuerAddress: ethereumAddress.describe(
    "Address of the added trusted issuer"
  ),
});

export type TrustedIssuerCreateInput = z.infer<
  typeof TrustedIssuerCreateInputSchema
>;
export type TrustedIssuerCreateOutput = z.infer<
  typeof TrustedIssuerCreateOutputSchema
>;
