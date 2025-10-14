import { assetBalance } from "@atk/zod/asset-balance";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import * as z from "zod";

/**
 * Input schema for querying a specific token holder's balance.
 *
 * This schema validates the request parameters for the token holder
 * endpoint, ensuring both the token address and holder address are
 * valid Ethereum addresses.
 *
 * @property {string} tokenAddress - The token contract address
 * @property {string} holderAddress - The holder's wallet address to query
 */
export const TokenHolderInputSchema = z.object({
  tokenAddress: ethereumAddress.describe("The token contract address"),
  holderAddress: ethereumAddress.describe("The holder's wallet address"),
});

/**
 * Response schema for token holder balance query.
 *
 * This schema defines the structure of the response data returned when
 * querying a specific holder's balance for a token. The holder field
 * will be null if the address has no balance or doesn't exist as a holder.
 *
 * @property {Object|null} holder - The holder's balance information or null
 * @property {Object} holder.account - Account information
 * @property {string} holder.account.id - The holder's address
 * @property {Dnum} holder.available - Available balance for transfer
 * @property {Dnum} holder.frozen - Frozen/locked balance amount
 * @property {boolean} holder.isFrozen - Whether the entire balance is frozen
 * @property {Dnum} holder.value - Total balance value (available + frozen)
 * @property {Date} holder.lastUpdatedAt - Last time the balance was updated
 */
export const TokenHolderResponseSchema = z.object({
  holder: assetBalance()
    .nullable()
    .describe("The holder's balance information, null if holder not found"),
});

/**
 * Type representing the input parameters for token holder query
 */
export type TokenHolderInput = z.infer<typeof TokenHolderInputSchema>;

/**
 * Type representing the response from token holder query
 */
export type TokenHolderResponse = z.infer<typeof TokenHolderResponseSchema>;
