import { baseContract } from "@/orpc/procedures/base.contract";
import {
  FactoryCreateOutputSchema,
  FactoryCreateSchema,
} from "@/orpc/routes/token/routes/factory/factory.create.schema";
import {
  FactoryListSchema,
  TokenFactoryListSchema,
} from "@/orpc/routes/token/routes/factory/factory.list.schema";
import {
  FactoryReadSchema,
  TokenFactoryDetailSchema,
} from "@/orpc/routes/token/routes/factory/factory.read.schema";
import {
  TokenCreateOutputSchema,
  TokenCreateSchema,
} from "@/orpc/routes/token/routes/mutations/create/token.create.schema";
import {
  TokenPauseInputSchema,
  TokenPauseOutputSchema,
} from "@/orpc/routes/token/routes/mutations/pause/token.pause.schema";
import {
  TokenUnpauseInputSchema,
  TokenUnpauseOutputSchema,
} from "@/orpc/routes/token/routes/mutations/pause/token.unpause.schema";
import {
  EventsResponseSchema,
  TokenEventsInputSchema,
} from "@/orpc/routes/token/routes/token.events.schema";
import {
  TokenHoldersInputSchema,
  TokenHoldersResponseSchema,
} from "@/orpc/routes/token/routes/token.holders.schema";
import {
  TokenListInputSchema,
  TokenListSchema,
} from "@/orpc/routes/token/routes/token.list.schema";
import {
  TokenReadInputSchema,
  TokenSchema,
} from "@/orpc/routes/token/routes/token.read.schema";
import {
  TokenStatsActivityByAssetInputSchema,
  TokenStatsActivityByAssetOutputSchema,
} from "@/orpc/routes/token/routes/token.stats.activity-by-asset.schema";
import {
  TokenStatsAssetCountInputSchema,
  TokenStatsAssetCountOutputSchema,
} from "@/orpc/routes/token/routes/token.stats.asset-count.schema";
import { TokenStatsAssetsOutputSchema } from "@/orpc/routes/token/routes/token.stats.assets.schema";
import {
  TokenStatsSupplyDistributionInputSchema,
  TokenStatsSupplyDistributionOutputSchema,
} from "@/orpc/routes/token/routes/token.stats.supply-distribution.schema";
import {
  TokenStatsTotalValueInputSchema,
  TokenStatsTotalValueOutputSchema,
} from "@/orpc/routes/token/routes/token.stats.total-value.schema";
import {
  TokenStatsTransactionCountInputSchema,
  TokenStatsTransactionCountOutputSchema,
} from "@/orpc/routes/token/routes/token.stats.transaction-count.schema";
import {
  TokenStatsTransactionHistoryInputSchema,
  TokenStatsTransactionHistoryOutputSchema,
} from "@/orpc/routes/token/routes/token.stats.transaction-history.schema";
import {
  TokenStatsTransactionsInputSchema,
  TokenStatsTransactionsOutputSchema,
} from "@/orpc/routes/token/routes/token.stats.transactions.schema";
import { TokenStatsValueOutputSchema } from "@/orpc/routes/token/routes/token.stats.value.schema";
import { eventIterator } from "@orpc/server";

const factoryCreate = baseContract
  .route({
    method: "POST",
    path: "/token/factory",
    description: "Create a new token factory",
    successDescription: "New token factory created",
    tags: ["token"],
  })
  .input(FactoryCreateSchema)
  .output(eventIterator(FactoryCreateOutputSchema));

const factoryList = baseContract
  .route({
    method: "GET",
    path: "/token/factory",
    description: "List all token factories",
    successDescription: "List of token factories",
    tags: ["token"],
  })
  .input(TokenFactoryListSchema)
  .output(FactoryListSchema);

const factoryRead = baseContract
  .route({
    method: "GET",
    path: "/token/factory/{id}",
    description: "Get a token factory by ID",
    successDescription: "Token factory details",
    tags: ["token"],
  })
  .input(FactoryReadSchema)
  .output(TokenFactoryDetailSchema);

const create = baseContract
  .route({
    method: "POST",
    path: "/token/create",
    description: "Create a new token (deposit, bond, etc.)",
    successDescription: "Token created successfully",
    tags: ["token"],
  })
  .input(TokenCreateSchema)
  .output(eventIterator(TokenCreateOutputSchema));

const list = baseContract
  .route({
    method: "GET",
    path: "/token",
    description: "Get the list of tokens",
    successDescription: "List of tokens",
    tags: ["token"],
  })
  .input(TokenListInputSchema)
  .output(TokenListSchema);

const read = baseContract
  .route({
    method: "GET",
    path: "/token/{tokenAddress}",
    description: "Get a token by address",
    successDescription: "Token",
    tags: ["token"],
  })
  .input(TokenReadInputSchema)
  .output(TokenSchema);

const statsAssets = baseContract
  .route({
    method: "GET",
    path: "/token/stats/assets",
    description: "Get token asset statistics",
    successDescription: "Asset statistics",
    tags: ["token", "stats"],
  })
  .output(TokenStatsAssetsOutputSchema);

const statsTransactions = baseContract
  .route({
    method: "GET",
    path: "/token/stats/transactions",
    description: "Get token transaction statistics",
    successDescription: "Transaction statistics",
    tags: ["token", "stats"],
  })
  .input(TokenStatsTransactionsInputSchema)
  .output(TokenStatsTransactionsOutputSchema);

const statsValue = baseContract
  .route({
    method: "GET",
    path: "/token/stats/value",
    description: "Get token value statistics",
    successDescription: "Value statistics",
    tags: ["token", "stats"],
  })
  .output(TokenStatsValueOutputSchema);

const statsAssetCount = baseContract
  .route({
    method: "GET",
    path: "/token/stats/asset-count",
    description: "Get asset count statistics",
    successDescription: "Asset count statistics",
    tags: ["token", "stats"],
  })
  .input(TokenStatsAssetCountInputSchema)
  .output(TokenStatsAssetCountOutputSchema);

const statsTransactionCount = baseContract
  .route({
    method: "GET",
    path: "/token/stats/transaction-count",
    description: "Get transaction count statistics",
    successDescription: "Transaction count statistics",
    tags: ["token", "stats"],
  })
  .input(TokenStatsTransactionCountInputSchema)
  .output(TokenStatsTransactionCountOutputSchema);

const statsTotalValue = baseContract
  .route({
    method: "GET",
    path: "/token/stats/total-value",
    description: "Get total value statistics",
    successDescription: "Total value statistics",
    tags: ["token", "stats"],
  })
  .input(TokenStatsTotalValueInputSchema)
  .output(TokenStatsTotalValueOutputSchema);

const statsSupplyDistribution = baseContract
  .route({
    method: "GET",
    path: "/token/stats/supply-distribution",
    description: "Get supply distribution for charts",
    successDescription: "Supply distribution data",
    tags: ["token", "stats"],
  })
  .input(TokenStatsSupplyDistributionInputSchema)
  .output(TokenStatsSupplyDistributionOutputSchema);

const statsActivityByAsset = baseContract
  .route({
    method: "GET",
    path: "/token/stats/activity-by-asset",
    description: "Get activity breakdown by asset type",
    successDescription: "Activity by asset data",
    tags: ["token", "stats"],
  })
  .input(TokenStatsActivityByAssetInputSchema)
  .output(TokenStatsActivityByAssetOutputSchema);

const statsTransactionHistory = baseContract
  .route({
    method: "GET",
    path: "/token/stats/transaction-history",
    description: "Get transaction history over time",
    successDescription: "Transaction history data",
    tags: ["token", "stats"],
  })
  .input(TokenStatsTransactionHistoryInputSchema)
  .output(TokenStatsTransactionHistoryOutputSchema);

const holders = baseContract
  .route({
    method: "GET",
    path: "/token/{tokenAddress}/holders",
    description: "Get token holders and their balances",
    successDescription: "List of token holders with balance information",
    tags: ["token"],
  })
  .input(TokenHoldersInputSchema)
  .output(TokenHoldersResponseSchema);

const events = baseContract
  .route({
    method: "GET",
    path: "/token/{tokenAddress}/events",
    description: "Get token events history",
    successDescription: "List of token events with details",
    tags: ["token"],
  })
  .input(TokenEventsInputSchema)
  .output(EventsResponseSchema);

const pause = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/pause",
    description: "Pause token transfers",
    successDescription: "Token paused successfully",
    tags: ["token"],
  })
  .input(TokenPauseInputSchema)
  .output(eventIterator(TokenPauseOutputSchema));

const unpause = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/unpause",
    description: "Unpause token transfers",
    successDescription: "Token unpaused successfully",
    tags: ["token"],
  })
  .input(TokenUnpauseInputSchema)
  .output(eventIterator(TokenUnpauseOutputSchema));

export const tokenContract = {
  factoryCreate,
  factoryList,
  factoryRead,
  create,
  events,
  holders,
  list,
  read,
  pause,
  unpause,
  statsActivityByAsset,
  statsAssetCount,
  statsAssets,
  statsSupplyDistribution,
  statsTotalValue,
  statsTransactionCount,
  statsTransactionHistory,
  statsTransactions,
  statsValue,
};
