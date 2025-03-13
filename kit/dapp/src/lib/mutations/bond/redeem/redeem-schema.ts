import { type ZodInfer, z } from "@/lib/utils/zod";

export const RedeemBondSchema = z.object({
  address: z.address(),
  amount: z.amount(),
  pincode: z.pincode(),
});

export type RedeemBondInput = ZodInfer<typeof RedeemBondSchema>;
