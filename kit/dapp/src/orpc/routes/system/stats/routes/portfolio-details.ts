import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import {
  assetFactoryTypeId,
  getAssetTypeFromFactoryTypeId,
} from "@atk/zod/asset-types";
import { bigDecimal } from "@atk/zod/bigdecimal";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { div, eq, from, multiply, toNumber } from "dnum";
import { z } from "zod";

/**
 * GraphQL query to fetch account system stats for total portfolio value
 */
const ACCOUNT_SYSTEM_STATS_QUERY = theGraphGraphql(`
  query AccountSystemStats($accountSystemId: ID!) {
    accountSystemStatsState(id: $accountSystemId) {
      totalValueInBaseCurrency
      balancesCount
    }
  }
`);

/**
 * GraphQL query to fetch token factory breakdown data
 */
const TOKEN_FACTORY_BREAKDOWN_QUERY = theGraphGraphql(`
  query TokenFactoryBreakdown($accountId: String!, $systemId: String!) {
    accountTokenFactoryStatsStates(
      where: {
        account: $accountId,
        system: $systemId,
        tokenBalancesCount_gt: 0
      }
    ) {
      tokenBalancesCount
      totalValueInBaseCurrency
      tokenFactory {
        id
        name
        typeId
      }
    }
  }
`);

// Schema for AccountSystemStats response
const AccountSystemStatsResponseSchema = z.object({
  accountSystemStatsState: z
    .object({
      totalValueInBaseCurrency: bigDecimal(),
      balancesCount: z.number(),
    })
    .nullable(),
});

// Schema for TokenFactoryBreakdown response
const TokenFactoryBreakdownResponseSchema = z.object({
  accountTokenFactoryStatsStates: z.array(
    z.object({
      tokenBalancesCount: z.number(),
      totalValueInBaseCurrency: bigDecimal(),
      tokenFactory: z.object({
        id: ethereumAddress,
        name: z.string(),
        typeId: assetFactoryTypeId(),
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
    const systemId = context.system.id.toLowerCase();
    const accountId = userAddress.toLowerCase();
    const accountSystemId = `${accountId}${systemId.slice(2)}`;

    // Fetch portfolio total value
    const accountSystemStatsResponse = await context.theGraphClient.query(
      ACCOUNT_SYSTEM_STATS_QUERY,
      {
        input: { accountSystemId },
        output: AccountSystemStatsResponseSchema,
      }
    );

    // Fetch token factory breakdown
    const tokenFactoryBreakdownResponse = await context.theGraphClient.query(
      TOKEN_FACTORY_BREAKDOWN_QUERY,
      {
        input: { accountId, systemId },
        output: TokenFactoryBreakdownResponseSchema,
      }
    );

    // Extract total value, defaulting to "0" if no stats
    const totalValue =
      accountSystemStatsResponse.accountSystemStatsState
        ?.totalValueInBaseCurrency ?? from(0);

    // Process token factory breakdown
    const tokenFactoryBreakdown =
      tokenFactoryBreakdownResponse.accountTokenFactoryStatsStates.map(
        (factoryStats) => {
          const factoryValue = from(factoryStats.totalValueInBaseCurrency);
          const percentage = eq(totalValue, from(0))
            ? 0
            : toNumber(div(multiply(factoryValue, from(100)), totalValue));

          return {
            tokenFactoryId: factoryStats.tokenFactory.id,
            tokenFactoryName: factoryStats.tokenFactory.name,
            tokenFactoryTypeId: factoryStats.tokenFactory.typeId,
            assetType: getAssetTypeFromFactoryTypeId(
              factoryStats.tokenFactory.typeId
            ),
            totalValue: factoryValue,
            tokenBalancesCount: factoryStats.tokenBalancesCount,
            percentage,
          };
        }
      );

    // Get total balances count from account system stats
    const totalAssetsHeld =
      accountSystemStatsResponse.accountSystemStatsState?.balancesCount ?? 0;

    return {
      totalValue,
      totalTokenFactories: tokenFactoryBreakdown.length,
      totalAssetsHeld,
      tokenFactoryBreakdown,
    };
  });
