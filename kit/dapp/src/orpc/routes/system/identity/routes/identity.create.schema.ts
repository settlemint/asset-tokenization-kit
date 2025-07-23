import { isoCountryCode } from "@/lib/zod/validators/iso-country-code";
import { MutationOutputSchema } from "@/orpc/routes/common/schemas/mutation.schema";
import { UserVerificationSchema } from "@/orpc/routes/common/schemas/user-verification.schema";
import { z } from "zod";

/**
 * Input schema for identity creation
 */
export const IdentityCreateSchema = z.object({
  country: isoCountryCode,
  verification: UserVerificationSchema,
});

/**
 * Output schema for identity creation
 */
export const IdentityCreateOutputSchema = MutationOutputSchema;

/**
 * Type definitions
 */
export type IdentityCreateInput = z.infer<typeof IdentityCreateSchema>;
export type IdentityCreateOutput = z.infer<typeof IdentityCreateOutputSchema>;
