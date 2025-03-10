import { type ZodInfer, z } from "@/lib/utils/zod";

export const TransferEquitySchema = z.object({
  address: z.address(),
  to: z.address(),
  value: z.amount(),
  pincode: z.pincode(),
  assetType: z.literal("equity"),
  decimals: z.decimals(),
});

export type TransferEquitySchema = ZodInfer<typeof TransferEquitySchema>;
