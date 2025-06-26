import { verificationType } from "@/lib/zod/validators/verification-type";
import { z } from "zod/v4";

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
