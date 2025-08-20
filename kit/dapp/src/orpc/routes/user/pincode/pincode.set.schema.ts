import { pincode as pincodeValidator } from "@atk/zod/pincode";
import { z } from "zod";

export const PincodeSetInputSchema = z.object({
  pincode: pincodeValidator,
});

export const PincodeSetOutputSchema = z.object({
  success: z.boolean(),
  verificationId: z.string(),
});

export type PincodeSetInput = z.infer<typeof PincodeSetInputSchema>;
export type PincodeSetOutput = z.infer<typeof PincodeSetOutputSchema>;
