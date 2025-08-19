import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { z } from "zod";

export const CreateWalletOutputSchema = z.object({
  wallet: ethereumAddress,
});
