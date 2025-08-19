import { UserVerificationSchema } from "@/orpc/routes/common/schemas/user-verification.schema";
import { isoCountryCode } from "@atk/zod/validators/iso-country-code";
import { z } from "zod";

/**
 * Input schema for identity registration
 */
export const IdentityRegisterSchema = z.object({
  country: isoCountryCode,
  walletVerification: UserVerificationSchema,
});

/**
 * Type definitions
 */
export type IdentityRegisterInput = z.infer<typeof IdentityRegisterSchema>;
