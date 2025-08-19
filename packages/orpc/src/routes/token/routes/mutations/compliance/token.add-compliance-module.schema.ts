import { ethereumAddress } from "@atk/zod/validators/ethereum-address";
import type { z } from "zod";
import { MutationInputSchemaWithContract } from "@/routes/common/schemas/mutation.schema";

export const TokenAddComplianceModuleInputSchema = MutationInputSchemaWithContract.extend({
  moduleAddress: ethereumAddress.describe("The address of the compliance module to add"),
});

export type TokenAddComplianceModuleInput = z.infer<typeof TokenAddComplianceModuleInputSchema>;
