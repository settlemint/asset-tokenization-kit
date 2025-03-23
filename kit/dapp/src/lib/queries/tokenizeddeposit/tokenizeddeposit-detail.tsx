import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { safeParse } from "@/lib/utils/typebox";
import { cache } from "react";
import { type Address, getAddress } from "viem";
import { tokenizedDepositCalculateFields } from "./tokenizeddeposit-calculated";
import {
  OffchainTokenizedDepositFragment,
  TokenizedDepositFragment,
} from "./tokenizeddeposit-fragment";
import {
  OffChainTokenizedDepositSchema,
  OnChainTokenizedDepositSchema,
} from "./tokenizeddeposit-schema";

/**
 * GraphQL query to fetch on-chain tokenized deposit details from The Graph
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
 * GraphQL query to fetch off-chain tokenized deposit details from Hasura
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
 * Props interface for tokenized deposit detail components
 */
export interface TokenizedDepositDetailProps {
  /** Ethereum address of the tokenized deposit contract */
  address: Address;
}

/**
 * Fetches and combines on-chain and off-chain tokenized deposit data
 *
 * @param params - Object containing the tokenized deposit address
 * @returns Combined tokenized deposit data with additional calculated metrics
 * @throws Error if fetching or parsing fails
 */
export const getTokenizedDepositDetail = cache(
  async ({ address }: TokenizedDepositDetailProps) => {
    const [onChainTokenizedDeposit, offChainTokenizedDeposit] =
      await Promise.all([
        (async () => {
          const response = await theGraphClientKit.request(
            TokenizedDepositDetail,
            {
              id: address,
            }
          );
          if (!response.tokenizedDeposit) {
            throw new Error("Tokenized deposit not found");
          }
          return safeParse(
            OnChainTokenizedDepositSchema,
            response.tokenizedDeposit
          );
        })(),
        (async () => {
          const response = await hasuraClient.request(
            OffchainTokenizedDepositDetail,
            {
              id: getAddress(address),
            }
          );
          if (response.asset.length === 0) {
            return undefined;
          }
          return safeParse(OffChainTokenizedDepositSchema, response.asset[0]);
        })(),
      ]);

    const calculatedFields = tokenizedDepositCalculateFields(
      onChainTokenizedDeposit,
      offChainTokenizedDeposit
    );

    return {
      ...onChainTokenizedDeposit,
      ...offChainTokenizedDeposit,
      ...calculatedFields,
    };
  }
);
