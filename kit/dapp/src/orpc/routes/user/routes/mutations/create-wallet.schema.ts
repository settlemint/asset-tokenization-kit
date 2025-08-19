import { ethereumAddress } from "@atk/zod/validators/ethereum-address";
import { z } from "zod";

export const CreateWalletOutputSchema = z.object({
  wallet: ethereumAddress,
});
