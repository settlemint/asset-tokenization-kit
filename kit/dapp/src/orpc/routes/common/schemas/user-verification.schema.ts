import { verificationType } from "@/lib/zod/validators/verification-type";
import { z } from "zod";

/**
 * User verification schema
 *
 * This schema is used to verify ownership of a user's wallet when executing a transaction.
 */
export const UserVerificationSchema = z.object({
  /**
   * The verification code
   */
  secretVerificationCode: z.string(),
  /**
   * The verification type
   */
  verificationType: verificationType.default("PINCODE"),
});

/**
 * User verification type
 */
export type UserVerification = z.infer<typeof UserVerificationSchema>;
