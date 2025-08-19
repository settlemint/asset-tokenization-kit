import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { UserVerificationSchema } from "@/orpc/routes/common/schemas/user-verification.schema";
import { z } from "zod";

/**
 * Input schema for identity creation
 */
export const IdentityCreateSchema = z.object({
  wallet: ethereumAddress
    .describe(
      "The wallet address of the user to create the identity for (defaults to the wallet of the authenticated user)"
    )
    .optional(),
  walletVerification: UserVerificationSchema,
});

/**
 * Type definitions
 */
export type IdentityCreateInput = z.infer<typeof IdentityCreateSchema>;
