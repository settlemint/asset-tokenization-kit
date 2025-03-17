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
  OffchainTokenizedDepositFragment,
  OffchainTokenizedDepositFragmentSchema,
  TokenizedDepositFragment,
  TokenizedDepositFragmentSchema,
} from "./tokenizeddeposit-fragment";

/**
 * GraphQL query to fetch on-chain stablecoin details from The Graph
 */
const TokenizedDepositDetail = theGraphGraphqlKit(
  `
  query TokenizedDepositDetail($id: ID!) {
    tokenizedDeposit(id: $id) {
      ...TokenizedDepositFragment
    }
  }
`,
  [TokenizedDepositFragment]
);

/**
 * GraphQL query to fetch off-chain stablecoin details from Hasura
 */
const OffchainTokenizedDepositDetail = hasuraGraphql(
  `
  query OffchainTokenizedDepositDetail($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
      ...OffchainTokenizedDepositFragment
    }
  }
`,
  [OffchainTokenizedDepositFragment]
);

/**
 * Props interface for stablecoin detail components
 */
export interface TokenizedDepositDetailProps {
  /** Ethereum address of the tokenized deposit contract */
  address: Address;
}

/**
 * Fetches and combines on-chain and off-chain stablecoin data
 *
 * @param params - Object containing the tokenized deposit address
 * @returns Combined tokenized deposit data with additional calculated metrics
 * @throws Error if fetching or parsing fails
 */
export const getTokenizedDepositDetail = cache(
  async ({ address }: TokenizedDepositDetailProps) => {
    const normalizedAddress = getAddress(address);

    const [data, dbTokenizedDeposit] = await Promise.all([
      theGraphClientKit.request(TokenizedDepositDetail, { id: address }),
      hasuraClient.request(OffchainTokenizedDepositDetail, {
        id: normalizedAddress,
      }),
    ]);

    const tokenizedDeposit = safeParseWithLogging(
      TokenizedDepositFragmentSchema,
      data.tokenizedDeposit,
      "tokenized deposit"
    );
    const offchainTokenizedDeposit = dbTokenizedDeposit.asset[0]
      ? safeParseWithLogging(
          OffchainTokenizedDepositFragmentSchema,
          dbTokenizedDeposit.asset[0],
          "offchain tokenized deposit"
        )
      : undefined;

    const topHoldersSum = tokenizedDeposit.holders.reduce(
      (sum, holder) => sum + holder.valueExact,
      0n
    );
    const concentration =
      tokenizedDeposit.totalSupplyExact === 0n
        ? 0
        : Number((topHoldersSum * 100n) / tokenizedDeposit.totalSupplyExact);

    const collateralProofValidity =
      tokenizedDeposit.lastCollateralUpdate.valueOf() > 0
        ? addSeconds(
            tokenizedDeposit.lastCollateralUpdate,
            tokenizedDeposit.liveness
          )
        : undefined;

    return {
      ...tokenizedDeposit,
      ...{
        private: false,
        ...offchainTokenizedDeposit,
      },
      concentration,
      collateralProofValidity,
    };
  }
);
