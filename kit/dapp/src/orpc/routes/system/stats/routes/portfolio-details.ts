import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import {
  assetFactoryTypeId,
  getAssetTypeFromFactoryTypeId,
  type AssetFactoryTypeId,
} from "@atk/zod/asset-types";
import { bigDecimal } from "@atk/zod/bigdecimal";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { add, div, eq, from, multiply, toNumber } from "dnum";
import { z } from "zod";

/**
 * GraphQL query to fetch account system stats for total portfolio value
 */
const ACCOUNT_SYSTEM_STATS_QUERY = theGraphGraphql(`
  query AccountSystemStats($accountId: ID!) {
    accountStatsState(id: $accountId) {
      totalValueInBaseCurrency
      balancesCount
    }
  }
`);

/**
 * GraphQL query to fetch token factory breakdown data
 */
const TOKEN_FACTORY_BREAKDOWN_QUERY = theGraphGraphql(`
  query TokenFactoryBreakdown($accountId: String!) {
    tokenStats_collection(
      interval: day
      where: { token_: { account: $accountId } }
    ) {
      totalValueInBaseCurrency: totalSupply
      token {
        tokenFactory { id name typeId }
      }
    }
  }
`);

// Schema for AccountSystemStats response
const AccountSystemStatsResponseSchema = z.object({
  accountStatsState: z
    .object({
      totalValueInBaseCurrency: bigDecimal(),
      balancesCount: z.number(),
    })
    .nullable(),
});

// Schema for TokenFactoryBreakdown response
const TokenFactoryBreakdownResponseSchema = z.object({
  tokenStats_collection: z.array(
    z.object({
      totalValueInBaseCurrency: bigDecimal(),
      token: z.object({
        tokenFactory: z
          .object({
            id: ethereumAddress,
            name: z.string(),
            typeId: assetFactoryTypeId(),
          })
          .nullable(),
      }),
    })
  ),
});

/**
 * Portfolio details route handler.
 *
 * Fetches comprehensive portfolio information for the authenticated user
 * within the current system, including total value and breakdown by token factory.
 *
 * The portfolio details provide current snapshot data optimized for
 * dashboard displays showing asset allocation and holdings summary.
 *
 * Authentication: Required
 * Method: GET /system/stats/portfolio/details
 *
 * @returns Promise<PortfolioDetailsMetrics> - Current portfolio breakdown data
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get current portfolio details
 * const { data } = await orpc.system.stats.portfolio.details.query();
 *
 * console.log(`Total Portfolio Value: ${data.totalValue}`);
 * console.log(`Number of Token Factories: ${data.totalTokenFactories}`);
 *
 * // Display breakdown by factory
 * data.tokenFactoryBreakdown.forEach(factory => {
 *   console.log(`${factory.tokenFactoryName}: ${factory.totalValue} (${factory.percentage}%)`);
 * });
 * ```
 */
export const statsPortfolioDetails =
  systemRouter.system.stats.portfolioDetails.handler(async ({ context }) => {
    // Get user's wallet address from auth context
    const userAddress = context.auth.user.wallet;
    const accountId = userAddress.toLowerCase();

    // Fetch portfolio total value
    const accountSystemStatsResponse = await context.theGraphClient.query(
      ACCOUNT_SYSTEM_STATS_QUERY,
      {
        input: { accountId },
        output: AccountSystemStatsResponseSchema,
      }
    );

    // Fetch token factory breakdown
    const tokenFactoryBreakdownResponse = await context.theGraphClient.query(
      TOKEN_FACTORY_BREAKDOWN_QUERY,
      {
        input: { accountId },
        output: TokenFactoryBreakdownResponseSchema,
      }
    );

    // Extract total value, defaulting to "0" if no stats
    const totalValue =
      accountSystemStatsResponse.accountStatsState?.totalValueInBaseCurrency ??
      from(0);

    // Process token factory breakdown
    const tokenFactoryBreakdown =
      tokenFactoryBreakdownResponse.tokenStats_collection
        .map((s) => ({
          factory: s.token.tokenFactory,
          value: s.totalValueInBaseCurrency,
        }))
        .filter((f) => !!f.factory)
        .map(
          (f) =>
            f as {
              factory: { id: string; name: string; typeId: string };
              value: ReturnType<typeof from>;
            }
        )
        .reduce(
          (acc, { factory, value }) => {
            const existing = acc.get(factory.id);
            const newValue = existing ? add(existing.totalValue, value) : value;
            acc.set(factory.id, {
              tokenFactoryId: factory.id,
              tokenFactoryName: factory.name,
              tokenFactoryTypeId: factory.typeId as AssetFactoryTypeId,
              assetType: getAssetTypeFromFactoryTypeId(
                factory.typeId as AssetFactoryTypeId
              ),
              totalValue: newValue,
              tokenBalancesCount: 0,
            });
            return acc;
          },
          new Map<
            string,
            {
              tokenFactoryId: string;
              tokenFactoryName: string;
              tokenFactoryTypeId: AssetFactoryTypeId;
              assetType: ReturnType<typeof getAssetTypeFromFactoryTypeId>;
              totalValue: ReturnType<typeof from>;
              tokenBalancesCount: number;
            }
          >()
        );

    const tokenFactoryBreakdownArray = [...tokenFactoryBreakdown.values()].map(
      (entry) => ({
        ...entry,
        percentage: eq(totalValue, from(0))
          ? 0
          : toNumber(div(multiply(entry.totalValue, from(100)), totalValue)),
      })
    );

    // Get total balances count from account system stats
    const totalAssetsHeld =
      accountSystemStatsResponse.accountStatsState?.balancesCount ?? 0;

    return {
      totalValue,
      totalTokenFactories: tokenFactoryBreakdownArray.length,
      totalAssetsHeld,
      tokenFactoryBreakdown: tokenFactoryBreakdownArray,
    };
  });
