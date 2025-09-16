import { assetSymbol } from "@atk/zod/asset-symbol";
import { bigDecimal } from "@atk/zod/bigdecimal";
import { decimals } from "@atk/zod/decimals";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { ethereumHex } from "@atk/zod/ethereum-hex";
import { z } from "zod";

export const UserAssetsInputSchema = z
  .object({
    wallet: ethereumAddress
      .optional()
      .describe(
        "The wallet address to get assets for. If not provided, uses the current user's wallet"
      ),
  })
  .optional();

export const TokenAssetSchema = z.object({
  id: ethereumAddress.describe("The token contract address"),
  name: z.string().describe("The token name"),
  symbol: assetSymbol().describe("The token symbol"),
  decimals: decimals().describe("The number of decimal places"),
  totalSupply: bigDecimal().describe("The total supply of the token"),
});

export const TokenBalanceSchema = z.object({
  id: ethereumHex.describe("The balance record ID"),
  value: bigDecimal().describe("The total balance amount"),
  frozen: bigDecimal().describe("The frozen balance amount"),
  available: bigDecimal().describe("The available balance amount"),
  token: TokenAssetSchema.describe("The token details"),
});

export const UserAssetsResponseSchema = z.array(TokenBalanceSchema);

export const UserAssetsGraphQLResponseSchema = z.object({
  tokenBalances: UserAssetsResponseSchema,
});

export type UserAssetsInput = z.infer<typeof UserAssetsInputSchema>;
export type TokenAsset = z.infer<typeof TokenAssetSchema>;
export type TokenBalance = z.infer<typeof TokenBalanceSchema>;
export type UserAssetsResponse = z.infer<typeof UserAssetsResponseSchema>;
