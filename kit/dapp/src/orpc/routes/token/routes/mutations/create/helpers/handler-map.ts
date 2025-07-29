import type { AssetType } from "@/lib/zod/validators/asset-types";
import { AssetTypeEnum } from "@/lib/zod/validators/asset-types";
import type { TransactionHash } from "@/lib/zod/validators/transaction-hash";
import { bondCreateHandler } from "@/orpc/routes/token/routes/mutations/create/helpers/create-handlers/bond.create";
import { depositCreateHandler } from "@/orpc/routes/token/routes/mutations/create/helpers/create-handlers/deposit.create";
import { equityCreateHandler } from "@/orpc/routes/token/routes/mutations/create/helpers/create-handlers/equity.create";
import { fundCreateHandler } from "@/orpc/routes/token/routes/mutations/create/helpers/create-handlers/fund.create";
import { stablecoinCreateHandler } from "@/orpc/routes/token/routes/mutations/create/helpers/create-handlers/stablecoin.create";
import type { TokenCreateContext } from "@/orpc/routes/token/routes/mutations/create/helpers/token.base-create";
import type { TokenCreateInput } from "@/orpc/routes/token/routes/mutations/create/token.create.schema";

export const tokenCreateHandlerMap: Record<
  AssetType,
  (
    input: TokenCreateInput,
    context: TokenCreateContext
  ) => Promise<TransactionHash>
> = {
  [AssetTypeEnum.deposit]: depositCreateHandler,
  [AssetTypeEnum.bond]: bondCreateHandler,
  [AssetTypeEnum.equity]: equityCreateHandler,
  [AssetTypeEnum.fund]: fundCreateHandler,
  [AssetTypeEnum.stablecoin]: stablecoinCreateHandler,
};
