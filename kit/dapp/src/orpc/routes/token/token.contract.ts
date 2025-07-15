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
import { TokenMintInputSchema } from "@/orpc/routes/token/routes/mutations/mint/token.mint.schema";
import {
  TokenBurnInputSchema,
  TokenBurnOutputSchema,
} from "@/orpc/routes/token/routes/mutations/burn/token.burn.schema";
import { TokenTransferSchema } from "@/orpc/routes/token/routes/mutations/transfer/token.transfer.schema";
import { TokenApproveInputSchema } from "@/orpc/routes/token/routes/mutations/approve/token.approve.schema";
import { TokenRedeemInputSchema } from "@/orpc/routes/token/routes/mutations/redeem/token.redeem.schema";
import { TokenTransactionOutputSchema } from "@/orpc/routes/token/routes/mutations/common/token.transaction.schema";
import { TokenFreezeAddressInputSchema } from "@/orpc/routes/token/routes/mutations/freeze/token.freeze-address.schema";
import { TokenRecoverTokensInputSchema } from "@/orpc/routes/token/routes/mutations/recovery/token.recover-tokens.schema";
import { TokenForcedRecoverInputSchema } from "@/orpc/routes/token/routes/mutations/recovery/token.forced-recover.schema";
import { TokenRecoverERC20InputSchema } from "@/orpc/routes/token/routes/mutations/recovery/token.recover-erc20.schema";
import { TokenSetCapInputSchema } from "@/orpc/routes/token/routes/mutations/cap/token.set-cap.schema";
import { TokenSetYieldScheduleInputSchema } from "@/orpc/routes/token/routes/mutations/yield/token.set-yield-schedule.schema";
import { TokenAddComplianceModuleInputSchema } from "@/orpc/routes/token/routes/mutations/compliance/token.add-compliance-module.schema";
import { TokenRemoveComplianceModuleInputSchema } from "@/orpc/routes/token/routes/mutations/compliance/token.remove-compliance-module.schema";
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
  .output(eventIterator(TokenTransactionOutputSchema));

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
    description:
      "Transfer tokens (standard, transferFrom, or forced) to one or more addresses",
    successDescription: "Tokens transferred successfully",
    tags: ["token"],
  })
  .input(TokenTransferSchema)
  .output(eventIterator(TokenTransactionOutputSchema));

const tokenApprove = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/approve",
    description: "Approve an address to spend tokens on behalf of the owner",
    successDescription: "Token allowance approved successfully",
    tags: ["token"],
  })
  .input(TokenApproveInputSchema)
  .output(eventIterator(TokenTransactionOutputSchema));

const tokenRedeem = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/redeem",
    description:
      "Redeem tokens for underlying assets (supports redeem-all for bonds)",
    successDescription: "Tokens redeemed successfully",
    tags: ["token"],
  })
  .input(TokenRedeemInputSchema)
  .output(eventIterator(TokenTransactionOutputSchema));

const tokenFreezeAddress = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/freeze-address",
    description: "Freeze or unfreeze an address from token transfers",
    successDescription: "Address freeze status updated successfully",
    tags: ["token"],
  })
  .input(TokenFreezeAddressInputSchema)
  .output(eventIterator(TokenTransactionOutputSchema));

const tokenRecoverTokens = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/recover-tokens",
    description: "Recover tokens from a lost wallet to the caller's wallet",
    successDescription: "Tokens recovered successfully",
    tags: ["token"],
  })
  .input(TokenRecoverTokensInputSchema)
  .output(eventIterator(TokenTransactionOutputSchema));

const tokenForcedRecover = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/forced-recover",
    description:
      "Force recover tokens from a lost wallet to a new wallet (custodian only)",
    successDescription: "Tokens force recovered successfully",
    tags: ["token"],
  })
  .input(TokenForcedRecoverInputSchema)
  .output(eventIterator(TokenTransactionOutputSchema));

const tokenRecoverERC20 = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/recover-erc20",
    description: "Recover mistakenly sent ERC20 tokens from the contract",
    successDescription: "ERC20 tokens recovered successfully",
    tags: ["token"],
  })
  .input(TokenRecoverERC20InputSchema)
  .output(eventIterator(TokenTransactionOutputSchema));

const tokenSetCap = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/set-cap",
    description: "Set the maximum supply cap for a capped token",
    successDescription: "Token cap updated successfully",
    tags: ["token"],
  })
  .input(TokenSetCapInputSchema)
  .output(eventIterator(TokenTransactionOutputSchema));

const tokenSetYieldSchedule = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/set-yield-schedule",
    description: "Set the yield schedule for a yield-bearing token",
    successDescription: "Yield schedule updated successfully",
    tags: ["token"],
  })
  .input(TokenSetYieldScheduleInputSchema)
  .output(eventIterator(TokenTransactionOutputSchema));

const tokenAddComplianceModule = baseContract
  .route({
    method: "POST",
    path: "/token/{contract}/add-compliance-module",
    description: "Add a compliance module to the token",
    successDescription: "Compliance module added successfully",
    tags: ["token"],
  })
  .input(TokenAddComplianceModuleInputSchema)
  .output(eventIterator(TokenTransactionOutputSchema));

const tokenRemoveComplianceModule = baseContract
  .route({
    method: "DELETE",
    path: "/token/{contract}/remove-compliance-module",
    description: "Remove a compliance module from the token",
    successDescription: "Compliance module removed successfully",
    tags: ["token"],
  })
  .input(TokenRemoveComplianceModuleInputSchema)
  .output(eventIterator(TokenTransactionOutputSchema));

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
  tokenApprove,
  tokenRedeem,
  tokenFreezeAddress,
  tokenRecoverTokens,
  tokenForcedRecover,
  tokenRecoverERC20,
  tokenSetCap,
  tokenSetYieldSchedule,
  tokenAddComplianceModule,
  tokenRemoveComplianceModule,
  statsAssets,
  statsTransactions,
  statsValue,
};
