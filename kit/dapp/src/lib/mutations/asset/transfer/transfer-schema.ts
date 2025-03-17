import { type ZodInfer, z } from "@/lib/utils/zod";

export const getTransferFormSchema = (balance?: string) =>
  z.object({
    address: z.address(),
    to: z.address(),
    value: balance
      ? z
          .number()
          .min(1, { message: "Amount is required" })
          .max(Number(balance), {
            message: `Amount cannot be greater than balance ${balance}`,
          })
      : z.amount(),
    assetType: z.assetType(),
    pincode: z.pincode(),
    decimals: z.decimals(),
  });

export type TransferFormSchema = ReturnType<typeof getTransferFormSchema>;
export type TransferFormType = ZodInfer<TransferFormSchema>;
export type TransferFormAssetType = ZodInfer<TransferFormSchema>["assetType"];
