import type { AssetType } from "@/lib/zod/validators/asset-types";
import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import { bondCreateHandler } from "@/orpc/helpers/token/create-handlers/bond.create";
import { depositCreateHandler } from "@/orpc/helpers/token/create-handlers/deposit.create";
import { equityCreateHandler } from "@/orpc/helpers/token/create-handlers/equity.create";
import { fundCreateHandler } from "@/orpc/helpers/token/create-handlers/fund.create";
import { stablecoinCreateHandler } from "@/orpc/helpers/token/create-handlers/stablecoin.create";
import type { TokenCreateContext } from "@/orpc/helpers/token/token.base-create";
import type {
  TokenCreateInput,
  TokenCreateOutput,
} from "@/orpc/routes/token/routes/token.create.schema";
export const tokenCreateHandlerMap: Record<
  AssetType,
  (
    input: TokenCreateInput,
    context: TokenCreateContext
  ) => AsyncGenerator<TokenCreateOutput>
> = {
  [AssetTypeEnum.deposit]: depositCreateHandler,
  [AssetTypeEnum.bond]: bondCreateHandler,
  [AssetTypeEnum.equity]: equityCreateHandler,
  [AssetTypeEnum.fund]: fundCreateHandler,
  [AssetTypeEnum.stablecoin]: stablecoinCreateHandler,
};
