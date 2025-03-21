import { type ZodInfer, z } from "@/lib/utils/zod";

export const WithdrawSchema = z.object({
  address: z.address(),
  to: z.address(),
  amount: z.amount(),
  pincode: z.pincode(),
  target: z.enum(["bond", "yield"]),
})

export type WithdrawInput = ZodInfer<typeof WithdrawSchema>;
