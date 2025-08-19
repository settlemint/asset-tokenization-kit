import { ethereumAddress } from "@atk/zod/src/validators/ethereum-address";
import { isoCountryCode } from "@atk/zod/validators/iso-country-code";
import { z } from "zod";
import { UserVerificationSchema } from "@/orpc/routes/common/schemas/user-verification.schema";

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
