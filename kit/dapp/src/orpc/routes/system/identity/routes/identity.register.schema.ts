import { isoCountryCode } from "@/lib/zod/validators/iso-country-code";
import { MutationOutputSchema } from "@/orpc/routes/common/schemas/mutation.schema";
import { UserVerificationSchema } from "@/orpc/routes/common/schemas/user-verification.schema";
import { z } from "zod";

/**
 * Input schema for identity registration
 */
export const IdentityRegisterSchema = z.object({
  country: isoCountryCode,
  verification: UserVerificationSchema,
});

/**
 * Output schema for identity registration
 */
export const IdentityRegisterOutputSchema = MutationOutputSchema;

/**
 * Type definitions
 */
export type IdentityRegisterInput = z.infer<typeof IdentityRegisterSchema>;
export type IdentityRegisterOutput = z.infer<
  typeof IdentityRegisterOutputSchema
>;
