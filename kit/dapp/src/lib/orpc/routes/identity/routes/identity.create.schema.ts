import { ethereumAddress } from "@/lib/utils/zod/validators/ethereum-address";
import { z } from "zod";

export const IdentityCreateSchema = z.object({
  walletAddress: ethereumAddress.describe(
    "The wallet address to create an identity for"
  ),
  country: z.string().optional().describe("The country code for the identity"),
});