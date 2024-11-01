import { isAddress } from "viem";
import { z } from "zod";

export const ApproveTokenSchema = z.object({
  spender: z.string(),
  approveAmount: z.coerce.number(),
  tokenAddress: z
    .string()
    .refine((address) => isAddress(address), { message: "Please enter a valid Ethereum address" }),
});

export type ApproveTokenSchemaType = z.infer<typeof ApproveTokenSchema>;

export const approveTokenDefaultValues: ApproveTokenSchemaType = {
  spender: "0x",
  approveAmount: 0,
  tokenAddress: "0x",
} as const;

export type ApproveTokenFormPageFields = keyof typeof approveTokenDefaultValues;

export const approveTokenFormPageFields: ApproveTokenFormPageFields[] = Object.keys(
  approveTokenDefaultValues,
) as ApproveTokenFormPageFields[];
