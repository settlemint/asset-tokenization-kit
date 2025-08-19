import { factoryCreate } from "./routes/factory.create";
import { factoryList } from "./routes/factory.list";
import { factoryPredictAddress } from "./routes/factory.predict-address";
import { factoryRead } from "./routes/factory.read";

const routes = {
  tokenFactoryCreate: factoryCreate,
  tokenFactoryList: factoryList,
  tokenFactoryPredictAddress: factoryPredictAddress,
  tokenFactoryRead: factoryRead,
};

export default routes;
