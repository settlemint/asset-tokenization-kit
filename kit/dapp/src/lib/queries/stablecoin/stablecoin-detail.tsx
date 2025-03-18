import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { safeParseWithLogging } from "@/lib/utils/zod";
import { addSeconds } from "date-fns";
import { cache } from "react";
import { type Address, getAddress } from "viem";
import {
  OffchainStableCoinFragment,
  OffchainStableCoinFragmentSchema,
  StableCoinFragment,
  StableCoinFragmentSchema,
} from "./stablecoin-fragment";

/**
 * GraphQL query to fetch on-chain stablecoin details from The Graph
 */
const StableCoinDetail = theGraphGraphqlKit(
  `
  query StableCoinDetail($id: ID!) {
    stableCoin(id: $id) {
      ...StableCoinFragment
    }
  }
`,
  [StableCoinFragment]
);

/**
 * GraphQL query to fetch off-chain stablecoin details from Hasura
 */
const OffchainStableCoinDetail = hasuraGraphql(
  `
  query OffchainStableCoinDetail($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
      ...OffchainStableCoinFragment
    }
  }
`,
  [OffchainStableCoinFragment]
);

/**
 * Props interface for stablecoin detail components
 */
export interface StableCoinDetailProps {
  /** Ethereum address of the stablecoin contract */
  address: Address;
}

/**
 * Fetches and combines on-chain and off-chain stablecoin data
 *
 * @param params - Object containing the stablecoin address
 * @returns Combined stablecoin data with additional calculated metrics
 * @throws Error if fetching or parsing fails
 */
export const getStableCoinDetail = cache(
  async ({ address }: StableCoinDetailProps) => {
    const normalizedAddress = getAddress(address);

    const [data, dbStableCoin] = await Promise.all([
      theGraphClientKit.request(StableCoinDetail, { id: address }),
      hasuraClient.request(OffchainStableCoinDetail, { id: normalizedAddress }),
    ]);

    const stableCoin = safeParseWithLogging(
      StableCoinFragmentSchema,
      data.stableCoin,
      "stablecoin"
    );
    const offchainStableCoin = dbStableCoin.asset[0]
      ? safeParseWithLogging(
          OffchainStableCoinFragmentSchema,
          dbStableCoin.asset[0],
          "offchain stablecoin"
        )
      : undefined;

    const topHoldersSum = stableCoin.holders.reduce(
      (sum, holder) => sum + holder.valueExact,
      0n
    );

    const concentration =
      stableCoin.totalSupplyExact === 0n
        ? 0
        : Number((topHoldersSum * 100n) / stableCoin.totalSupplyExact);

    const collateralProofValidity =
      stableCoin.lastCollateralUpdate.valueOf() > 0
        ? addSeconds(stableCoin.lastCollateralUpdate, stableCoin.liveness)
        : undefined;

    return {
      ...stableCoin,
      ...{
        private: false,
        ...offchainStableCoin,
      },
      concentration,
      collateralProofValidity,
    };
  }
);
