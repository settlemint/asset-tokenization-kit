import { factoryCreate } from "@/orpc/routes/system/token-factory/routes/factory.create";
import { factoryList } from "@/orpc/routes/system/token-factory/routes/factory.list";
import { factoryPredictAddress } from "@/orpc/routes/system/token-factory/routes/factory.predict-address";
import { factoryRead } from "@/orpc/routes/system/token-factory/routes/factory.read";

const routes = {
  tokenFactoryCreate: factoryCreate,
  tokenFactoryList: factoryList,
  tokenFactoryPredictAddress: factoryPredictAddress,
  tokenFactoryRead: factoryRead,
};

export default routes;
