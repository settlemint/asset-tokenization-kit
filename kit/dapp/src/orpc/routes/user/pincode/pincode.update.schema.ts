import { pincode as pincodeValidator } from "@atk/zod/pincode";
import { z } from "zod";

export const PincodeUpdateInputSchema = z.object({
  pincode: pincodeValidator,
});

export const PincodeUpdateOutputSchema = z.object({
  success: z.boolean(),
  verificationId: z.string(),
});

export type PincodeUpdateInput = z.infer<typeof PincodeUpdateInputSchema>;
export type PincodeUpdateOutput = z.infer<typeof PincodeUpdateOutputSchema>;
