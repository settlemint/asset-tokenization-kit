import { factoryCreateContract } from "./routes/factory.create.contract";
import { factoryListContract } from "./routes/factory.list.contract";
import { factoryPredictAddressContract } from "./routes/factory.predict-address.contract";
import { factoryReadContract } from "./routes/factory.read.contract";

export const factoryContract = {
  tokenFactoryCreate: factoryCreateContract,
  tokenFactoryList: factoryListContract,
  tokenFactoryRead: factoryReadContract,
  tokenFactoryPredictAddress: factoryPredictAddressContract,
};
