import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";
import { MutationInputSchema } from "@/orpc/routes/common/schemas/mutation.schema";

/**
 * Input schema for deleting a trusted issuer
 */
export const TrustedIssuerDeleteInputSchema = MutationInputSchema.extend({
  issuerAddress: ethereumAddress.describe(
    "The identity address of the trusted issuer to remove"
  ),
});

/**
 * Output schema for deleting a trusted issuer
 */
export const TrustedIssuerDeleteOutputSchema = z.object({
  transactionHash: z
    .string()
    .describe("Transaction hash of the delete operation"),
  issuerAddress: ethereumAddress.describe(
    "Address of the removed trusted issuer"
  ),
});

export type TrustedIssuerDeleteInput = z.infer<
  typeof TrustedIssuerDeleteInputSchema
>;
export type TrustedIssuerDeleteOutput = z.infer<
  typeof TrustedIssuerDeleteOutputSchema
>;
