import { UserVerificationSchema } from "../common/schemas/user-verification.schema";
import { z } from "zod";

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
