import { z } from "zod";

export const KycDeleteInputSchema = z.object({
  userId: z.string().min(1),
});

export const KycDeleteOutputSchema = z.object({
  userId: z.string().min(1),
});

export type KycDeleteInput = z.infer<typeof KycDeleteInputSchema>;
export type KycDeleteOutput = z.infer<typeof KycDeleteOutputSchema>;
