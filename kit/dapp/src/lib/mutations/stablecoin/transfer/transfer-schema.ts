import { type ZodInfer, z } from "@/lib/utils/zod";

export const TransferStableCoinSchema = z.object({
  address: z.address(),
  to: z.address(),
  value: z.amount(),
  pincode: z.pincode(),
  assetType: z.literal("stablecoin"),
  decimals: z.decimals(),
  user: z.object({
    wallet: z.address(),
  }),
});

export type TransferStableCoinSchema = ZodInfer<
  typeof TransferStableCoinSchema
>;

export type TransferStableCoinInput = ZodInfer<typeof TransferStableCoinSchema>;
