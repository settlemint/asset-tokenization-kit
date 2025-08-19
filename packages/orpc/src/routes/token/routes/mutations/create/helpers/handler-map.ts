import type { AssetType } from "@atk/zod/validators/asset-types";
import { AssetTypeEnum } from "@atk/zod/validators/asset-types";
import type { EthereumHash } from "@atk/zod/validators/ethereum-hash";
import { bondCreateHandler } from "@/routes/token/routes/mutations/create/helpers/create-handlers/bond.create";
import { depositCreateHandler } from "@/routes/token/routes/mutations/create/helpers/create-handlers/deposit.create";
import { equityCreateHandler } from "@/routes/token/routes/mutations/create/helpers/create-handlers/equity.create";
import { fundCreateHandler } from "@/routes/token/routes/mutations/create/helpers/create-handlers/fund.create";
import { stablecoinCreateHandler } from "@/routes/token/routes/mutations/create/helpers/create-handlers/stablecoin.create";
import type { TokenCreateContext } from "@/routes/token/routes/mutations/create/helpers/token.base-create";
import type { TokenCreateInput } from "@/routes/token/routes/mutations/create/token.create.schema";

export const tokenCreateHandlerMap: Record<
  AssetType,
  (input: TokenCreateInput, context: TokenCreateContext) => Promise<EthereumHash>
> = {
  [AssetTypeEnum.deposit]: depositCreateHandler,
  [AssetTypeEnum.bond]: bondCreateHandler,
  [AssetTypeEnum.equity]: equityCreateHandler,
  [AssetTypeEnum.fund]: fundCreateHandler,
  [AssetTypeEnum.stablecoin]: stablecoinCreateHandler,
};
