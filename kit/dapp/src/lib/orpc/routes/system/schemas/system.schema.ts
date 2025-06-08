import { ethereumAddress } from "@/lib/utils/zod/validators/ethereum-address";
import { z } from "zod";

export const SystemSchema = z.object({
  id: ethereumAddress,
});
