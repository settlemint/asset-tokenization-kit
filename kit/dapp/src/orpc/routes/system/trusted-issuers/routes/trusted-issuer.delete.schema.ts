import { BaseMutationOutputSchema } from "@/orpc/routes/common/schemas/mutation-output.schema";
import { MutationInputSchema } from "@/orpc/routes/common/schemas/mutation.schema";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import * as z from "zod";

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
export const TrustedIssuerDeleteOutputSchema = BaseMutationOutputSchema.extend({
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
