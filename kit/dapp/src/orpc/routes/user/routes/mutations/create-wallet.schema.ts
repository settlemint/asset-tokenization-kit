import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

export const CreateWalletOutputSchema = z.object({
  wallet: ethereumAddress,
});
