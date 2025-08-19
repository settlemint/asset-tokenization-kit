import { ethereumAddress } from "@atk/zod/validators/ethereum-address";
import type { z } from "zod";
import { MutationInputSchemaWithContract } from "@/routes/common/schemas/mutation.schema";

export const TokenRemoveComplianceModuleInputSchema = MutationInputSchemaWithContract.extend({
  moduleAddress: ethereumAddress.describe("The address of the compliance module to remove"),
});

export type TokenRemoveComplianceModuleInput = z.infer<typeof TokenRemoveComplianceModuleInputSchema>;
