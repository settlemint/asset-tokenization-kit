import { fetchAllTheGraphPages } from "@/lib/pagination";
import {
	theGraphClientStarterkits,
	theGraphGraphqlStarterkits,
} from "@/lib/settlemint/the-graph";
import { safeParseWithLogging } from "@/lib/utils/zod";
import { cache } from "react";
import type { Address } from "viem";
import { BalanceFragment, BalanceFragmentSchema } from "./balance-fragment";

const MyAssets = theGraphGraphqlStarterkits(
	`
  query MyAssets($accountId: ID!, $first: Int, $skip: Int) {
    account(id: $accountId) {
      balances(first: $first, skip: $skip) {
        ...BalanceFragment
      }
    }
  }
`,
	[BalanceFragment],
);

type AssetType = 'StableCoin' | 'Bond' | 'Fund' | 'Equity' | 'CryptoCurrency';

export type MyAsset = Awaited<ReturnType<typeof getPortfolioDashboardData>>['balances'][number];


export const getPortfolioDashboardData = cache(
	async (wallet: Address, active = true) => {
		const [myAssets] = await Promise.all([
			fetchAllTheGraphPages(async (first, skip) => {
				const pageResult = await theGraphClientStarterkits.request(MyAssets, {
					accountId: wallet,
					first,
					skip,
				});
				return pageResult.account?.balances ?? [];
			}),
		]);

		// Parse and validate the data using Zod schemas
		let validatedMyAssets = myAssets.map((asset) =>
			safeParseWithLogging(BalanceFragmentSchema, asset, "balance"),
		);

		if (!validatedMyAssets.length) {
			return {
				balances: [],
				distribution: [],
				total: "0",
			};
		}

		if (active) {
			validatedMyAssets = validatedMyAssets.filter((balance) => {
				const asset = balance.asset;
				if (['StableCoin' , 'Bond' , 'Fund' , 'Equity' , 'CryptoCurrency'].includes(asset.type)) {
					return true;
				}
				return !asset.paused;
			});
		}

		// Group and sum balances by asset type
		const assetTypeBalances = validatedMyAssets.reduce<
			Record<AssetType, number>
		>(
			(acc, balance) => {
				const assetType = balance.asset.type as AssetType;
				if (!acc[assetType]) {
					acc[assetType] = 0;
				}
				acc[assetType] = acc[assetType] + Number(balance.value.toString());
				return acc;
			},
			{} as Record<AssetType, number>,
		);

		// Calculate total across all types
		const total = Object.values(assetTypeBalances).reduce(
			(acc, value) => acc + value,
			0,
		);

		// Calculate distribution percentages by type
		const distribution = Object.entries(assetTypeBalances).map(
			([type, value]) => ({
				asset: { type: type as AssetType },
				value: Number(value.toString()),
				percentage: total > 0
					? ((value / total) * 100).toFixed(2)
					: "0",
			}),
		);

		return {
			balances: validatedMyAssets,
			distribution,
			total: total.toString(),
		};
	},
);
