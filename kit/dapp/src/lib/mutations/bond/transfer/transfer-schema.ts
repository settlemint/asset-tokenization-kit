import { type ZodInfer, z } from "@/lib/utils/zod";

export const TransferBondSchema = z.object({
  address: z.address(),
  to: z.address(),
  value: z.amount(),
  pincode: z.pincode(),
  assetType: z.literal("bond"),
  decimals: z.decimals(),
});

export type TransferBondSchema = ZodInfer<typeof TransferBondSchema>;
