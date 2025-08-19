import { z } from "zod";
import { UserVerificationSchema } from "@/routes/common/schemas/user-verification.schema";

/**
 * Input schema for identity creation
 */
export const IdentityCreateSchema = z.object({
  walletVerification: UserVerificationSchema,
});

/**
 * Type definitions
 */
export type IdentityCreateInput = z.infer<typeof IdentityCreateSchema>;
