import { bondCreateHandler } from "./create-handlers/bond.create";
import { depositCreateHandler } from "./create-handlers/deposit.create";
import { equityCreateHandler } from "./create-handlers/equity.create";
import { fundCreateHandler } from "./create-handlers/fund.create";
import { stablecoinCreateHandler } from "./create-handlers/stablecoin.create";
import type { TokenCreateContext } from "./token.base-create";
import type { TokenCreateInput } from "../token.create.schema";
import type { AssetType } from "@atk/zod/validators/asset-types";
import { AssetTypeEnum } from "@atk/zod/validators/asset-types";
import type { EthereumHash } from "@atk/zod/validators/ethereum-hash";

export const tokenCreateHandlerMap: Record<
  AssetType,
  (
    input: TokenCreateInput,
    context: TokenCreateContext,
  ) => Promise<EthereumHash>
> = {
  [AssetTypeEnum.deposit]: depositCreateHandler,
  [AssetTypeEnum.bond]: bondCreateHandler,
  [AssetTypeEnum.equity]: equityCreateHandler,
  [AssetTypeEnum.fund]: fundCreateHandler,
  [AssetTypeEnum.stablecoin]: stablecoinCreateHandler,
};
