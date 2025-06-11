import { ethereumAddress } from "@/lib/utils/zod/validators/ethereum-address";
import { CreateSchema } from "../../common/create.schema";

export const SystemCreateSchema = CreateSchema.extend({
  contract: ethereumAddress
    .describe("The address of the contract to call this function on")
    .default("0x5e771e1417100000000000000000000000020088"),
});
