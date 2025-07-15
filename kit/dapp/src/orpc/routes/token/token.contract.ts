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
  TokenMintInputSchema,
  TokenMintOutputSchema,
} from "@/orpc/routes/token/routes/mutations/mint/token.mint.schema";
import {
  TokenBurnInputSchema,
  TokenBurnOutputSchema,
} from "@/orpc/routes/token/routes/mutations/burn/token.burn.schema";
import {
  TokenTransferSchema,
  TokenTransferFromSchema,
  TokenForcedTransferSchema,
} from "@/orpc/routes/token/routes/mutations/transfer/token.transfer.schema";
import { TokenApproveInputSchema } from "@/orpc/routes/token/routes/mutations/approve/token.approve.schema";
import {
  TokenRedeemInputSchema,
  TokenRedeemAllInputSchema,
} from "@/orpc/routes/token/routes/mutations/redeem/token.redeem.schema";
import { TokenFreezeAddressInputSchema } from "@/orpc/routes/token/routes/mutations/freeze/token.freeze-address.schema";
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
import { TokenStatsAssetsOutputSchema } from "@/orpc/routes/token/routes/token.stats.assets.schema";
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

const mint = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/mint",
    description: "Mint new tokens to one or more addresses",
    successDescription: "Tokens minted successfully",
    tags: ["token"],
  })
  .input(TokenMintInputSchema)
  .output(eventIterator(TokenMintOutputSchema));

const burn = baseContract
  .route({
    method: "DELETE",
    path: "/token/{contract}/burn",
    description: "Burn tokens from one or more addresses",
    successDescription: "Tokens burned successfully",
    tags: ["token"],
  })
  .input(TokenBurnInputSchema)
  .output(eventIterator(TokenBurnOutputSchema));

const transfer = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/transfer",
    description: "Transfer tokens to one or more addresses",
    successDescription: "Tokens transferred successfully",
    tags: ["token"],
  })
  .input(TokenTransferSchema)
  .output(eventIterator(TokenMintOutputSchema)); // Reusing mint output schema for transaction hash

const transferFrom = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/transfer-from",
    description: "Transfer tokens from one address to another using allowance",
    successDescription: "Tokens transferred successfully",
    tags: ["token"],
  })
  .input(TokenTransferFromSchema)
  .output(eventIterator(TokenMintOutputSchema));

const forcedTransfer = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/forced-transfer",
    description:
      "Force transfer tokens without approval (custodian only) - supports batch operations",
    successDescription: "Tokens force transferred successfully",
    tags: ["token"],
  })
  .input(TokenForcedTransferSchema)
  .output(eventIterator(TokenMintOutputSchema));

const tokenApprove = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/approve",
    description: "Approve an address to spend tokens on behalf of the owner",
    successDescription: "Token allowance approved successfully",
    tags: ["token"],
  })
  .input(TokenApproveInputSchema)
  .output(eventIterator(TokenMintOutputSchema));

const tokenRedeem = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/redeem",
    description: "Redeem tokens for underlying assets",
    successDescription: "Tokens redeemed successfully",
    tags: ["token"],
  })
  .input(TokenRedeemInputSchema)
  .output(eventIterator(TokenMintOutputSchema));

const tokenRedeemAll = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/redeem-all",
    description: "Redeem all tokens for underlying assets (typically bonds)",
    successDescription: "All tokens redeemed successfully",
    tags: ["token"],
  })
  .input(TokenRedeemAllInputSchema)
  .output(eventIterator(TokenMintOutputSchema));

const tokenFreezeAddress = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/freeze-address",
    description: "Freeze or unfreeze an address from token transfers",
    successDescription: "Address freeze status updated successfully",
    tags: ["token"],
  })
  .input(TokenFreezeAddressInputSchema)
  .output(eventIterator(TokenMintOutputSchema));

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
  mint,
  burn,
  transfer,
  transferFrom,
  forcedTransfer,
  tokenApprove,
  tokenRedeem,
  tokenRedeemAll,
  tokenFreezeAddress,
  statsAssets,
  statsTransactions,
  statsValue,
};
