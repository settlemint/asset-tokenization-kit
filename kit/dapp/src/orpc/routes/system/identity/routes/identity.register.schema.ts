import { ethereumAddress } from "@/lib/zodsrc/validators/ethereum-address";
import { isoCountryCode } from "@/lib/zodvalidators/iso-country-code";
import { UserVerificationSchema } from "@/orpc/routes/common/schemas/user-verification.schema";
import { z } from "zod";

/**
 * Input schema for identity registration
 */
export const IdentityRegisterSchema = z.object({
  wallet: ethereumAddress
    .describe(
      "The wallet address of the user to register the identity for (defaults to the wallet of the authenticated user)"
    )
    .optional(),
  country: isoCountryCode,
  walletVerification: UserVerificationSchema,
});

/**
 * Type definitions
 */
export type IdentityRegisterInput = z.infer<typeof IdentityRegisterSchema>;
