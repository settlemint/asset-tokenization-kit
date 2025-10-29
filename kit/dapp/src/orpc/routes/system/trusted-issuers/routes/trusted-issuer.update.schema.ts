import { BaseMutationOutputSchema } from "@/orpc/routes/common/schemas/mutation-output.schema";
import { MutationInputSchema } from "@/orpc/routes/common/schemas/mutation.schema";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

/**
 * Input schema for updating a trusted issuer's topics
 */
export const TrustedIssuerUpdateInputSchema = MutationInputSchema.extend({
  issuerAddress: ethereumAddress.describe(
    "The identity address of the trusted issuer to update"
  ),
  claimTopicIds: z
    .array(z.string())
    .min(1)
    .describe("New array of topic IDs this issuer can verify"),
});

/**
 * Output schema for updating a trusted issuer
 */
export const TrustedIssuerUpdateOutputSchema = BaseMutationOutputSchema.extend({
  issuerAddress: ethereumAddress.describe(
    "Address of the updated trusted issuer"
  ),
});

export type TrustedIssuerUpdateInput = z.infer<
  typeof TrustedIssuerUpdateInputSchema
>;
export type TrustedIssuerUpdateOutput = z.infer<
  typeof TrustedIssuerUpdateOutputSchema
>;
