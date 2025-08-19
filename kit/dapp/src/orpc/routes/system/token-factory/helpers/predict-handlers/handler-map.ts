import type { ValidatedPortalClient } from "@/orpc/middlewares/services/portal.middleware";
import type {
  PredictAddressInput,
  PredictAddressOutput,
} from "@/orpc/routes/system/token-factory/routes/factory.predict-address.schema";
import type { AssetType } from "@atk/zod/validators/asset-types";
import { AssetTypeEnum } from "@atk/zod/validators/asset-types";
import type { EthereumAddress } from "@atk/zod/validators/ethereum-address";
import { bondPredictHandler } from "./bond.predict";
import { depositPredictHandler } from "./deposit.predict";
import { equityPredictHandler } from "./equity.predict";
import { fundPredictHandler } from "./fund.predict";
import { stablecoinPredictHandler } from "./stablecoin.predict";

export interface PredictHandlerContext {
  factoryAddress: EthereumAddress;
  portalClient: ValidatedPortalClient;
}

export const predictAddressHandlerMap: Record<
  AssetType,
  (
    input: PredictAddressInput,
    context: PredictHandlerContext
  ) => Promise<PredictAddressOutput>
> = {
  [AssetTypeEnum.deposit]: depositPredictHandler,
  [AssetTypeEnum.bond]: bondPredictHandler,
  [AssetTypeEnum.equity]: equityPredictHandler,
  [AssetTypeEnum.fund]: fundPredictHandler,
  [AssetTypeEnum.stablecoin]: stablecoinPredictHandler,
};
