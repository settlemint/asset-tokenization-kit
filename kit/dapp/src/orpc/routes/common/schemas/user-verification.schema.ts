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
  verificationCode: z.string(),
  /**
   * The verification type
   */
  verificationType: verificationType.default("pincode"),
});

/**
 * User verification type
 */
export type UserVerification = z.infer<typeof UserVerificationSchema>;
