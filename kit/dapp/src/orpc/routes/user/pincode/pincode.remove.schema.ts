import { z } from "zod";

export const PincodeRemoveOutputSchema = z.object({
  success: z.boolean(),
});

export type PincodeRemoveOutput = z.infer<typeof PincodeRemoveOutputSchema>;
