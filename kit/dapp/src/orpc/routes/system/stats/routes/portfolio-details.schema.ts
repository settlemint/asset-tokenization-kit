import { assetFactoryTypeId, assetType } from "@atk/zod/asset-types";
import { bigDecimal } from "@atk/zod/bigdecimal";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

/**
 * Input schema for portfolio details endpoint
 */
export const StatsPortfolioDetailsInputSchema = z.object({}).strict();

/**
 * Output schema for portfolio details endpoint
 */
export const StatsPortfolioDetailsOutputSchema = z.object({
  totalValue: bigDecimal().describe("Total portfolio value in base currency"),
  totalTokenFactories: z
    .number()
    .int()
    .min(0)
    .describe("Number of token factories with balances"),
  totalAssetsHeld: z.number().int().min(0).describe("Number of assets held"),
  tokenFactoryBreakdown: z.array(
    z.object({
      tokenFactoryId: ethereumAddress.describe("Factory contract address"),
      tokenFactoryName: z.string().describe("Human readable factory name"),
      tokenFactoryTypeId: assetFactoryTypeId().describe(
        "Factory type identifier (e.g., ATKBondFactory)"
      ),
      assetType: assetType().describe(
        "Asset type derived from factory typeId (e.g., bond)"
      ),
      totalValue: bigDecimal().describe("Factory value in base currency"),
      tokenBalancesCount: z
        .number()
        .int()
        .min(0)
        .describe("Number of tokens held from this factory"),
      percentage: z
        .number()
        .min(0)
        .max(100)
        .describe("Percentage of total portfolio value"),
    })
  ),
});

export type StatsPortfolioDetailsInput = z.infer<
  typeof StatsPortfolioDetailsInputSchema
>;
export type StatsPortfolioDetailsOutput = z.infer<
  typeof StatsPortfolioDetailsOutputSchema
>;
