import { factoryAvailableContract } from "@/orpc/routes/system/token-factory/routes/factory.available.contract";
import { factoryCreateContract } from "@/orpc/routes/system/token-factory/routes/factory.create.contract";
import { factoryListContract } from "@/orpc/routes/system/token-factory/routes/factory.list.contract";
import { factoryPredictAddressContract } from "@/orpc/routes/system/token-factory/routes/factory.predict-address.contract";
import { factoryReadContract } from "@/orpc/routes/system/token-factory/routes/factory.read.contract";

export const factoryContract = {
  create: factoryCreateContract,
  list: factoryListContract,
  read: factoryReadContract,
  predictAddress: factoryPredictAddressContract,
  available: factoryAvailableContract,
};
