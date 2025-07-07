import type { AssetType } from "@/lib/zod/validators/asset-types";
import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import { bondCreateHandler } from "@/orpc/helpers/token/create-handlers/bond.create";
import { depositCreateHandler } from "@/orpc/helpers/token/create-handlers/deposit.create";
import type { TokenCreateContext } from "@/orpc/helpers/token/token.create";
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
  [AssetTypeEnum.bond]: bondCreateHandler, // TODO: Replace with bondCreate when available
  [AssetTypeEnum.equity]: depositCreateHandler, // TODO: Replace with equityCreate when available
  [AssetTypeEnum.fund]: depositCreateHandler, // TODO: Replace with fundCreate when available
  [AssetTypeEnum.stablecoin]: depositCreateHandler, // TODO: Replace with stablecoinCreate when available
};
