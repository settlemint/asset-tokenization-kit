import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { z } from "zod/v4";

export const UserMeSchema = z.object({
  name: z.string(),
  email: z.email(),
  wallet: ethereumAddress,
});

export type UserMe = z.infer<typeof UserMeSchema>;
