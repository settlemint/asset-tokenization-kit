import { ethereumAddress } from "@atk/zod/ethereum-address";
import * as z from "zod";

export const CreateWalletOutputSchema = z.object({
  wallet: ethereumAddress,
});
