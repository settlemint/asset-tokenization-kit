import { z } from "zod";

/**
 * Input schema for value endpoint (no input required)
 */
export const ValueInputSchema = z.object({}).strict();

/**
 * Input schema for total value endpoint (no input required)
 */
export const TotalValueInputSchema = z.object({}).strict();

/**
 * Output schema for value endpoint
 */
export const ValueOutputSchema = z.object({
  totalValue: z.string(),
});

/**
 * Output schema for total value endpoint
 */
export const TotalValueOutputSchema = z.object({
  totalValue: z.string(),
});

export type ValueInput = z.infer<typeof ValueInputSchema>;
export type ValueOutput = z.infer<typeof ValueOutputSchema>;
export type TotalValueInput = z.infer<typeof TotalValueInputSchema>;
export type TotalValueOutput = z.infer<typeof TotalValueOutputSchema>;
