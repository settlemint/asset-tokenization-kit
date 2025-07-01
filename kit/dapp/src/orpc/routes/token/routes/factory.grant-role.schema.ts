import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { z } from "zod/v4";

export const FactoryGrantRoleSchema = z.object({
  account: ethereumAddress.describe("The account to grant the role to"),
});
