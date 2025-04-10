"use server";

import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cache } from "react";
import { type Address, getAddress } from "viem";
import { depositsCalculateFields } from "./deposit-calculated";
import { DepositFragment, OffchainDepositFragment } from "./deposit-fragment";
import { OffChainDepositSchema, OnChainDepositSchema } from "./deposit-schema";

/**
 * GraphQL query to fetch on-chain tokenized deposit details from The Graph
 */
const DepositDetail = theGraphGraphqlKit(
  `
  query DepositDetail($id: ID!) {
    deposit(id: $id) {
      ...DepositFragment
    }
  }
`,
  [DepositFragment]
);

/**
 * GraphQL query to fetch off-chain tokenized deposit details from Hasura
 */
const OffchainDepositDetail = hasuraGraphql(
  `
  query OffchainDepositDetail($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
      ...OffchainDepositFragment
    }
  }
`,
  [OffchainDepositFragment]
);

/**
 * Props interface for tokenized deposit detail components
 */
export interface DepositDetailProps {
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
export const getDepositDetail = withTracing(
  "queries",
  "getDepositDetail",
  cache(async ({ address }: DepositDetailProps) => {
    const [onChainDeposit, offChainDeposit] = await Promise.all([
      (async () => {
        const response = await theGraphClientKit.request(DepositDetail, {
          id: address,
        });
        if (!response.deposit) {
          throw new Error("Deposit not found");
        }
        return safeParse(OnChainDepositSchema, response.deposit);
      })(),
      (async () => {
        const response = await hasuraClient.request(OffchainDepositDetail, {
          id: getAddress(address),
        });
        if (response.asset.length === 0) {
          return undefined;
        }
        return safeParse(OffChainDepositSchema, response.asset[0]);
      })(),
    ]);

    const calculatedFields = await depositsCalculateFields(
      [onChainDeposit],
      [offChainDeposit]
    );
    const calculatedDeposit = calculatedFields.get(onChainDeposit.id)!;

    return {
      ...onChainDeposit,
      ...offChainDeposit,
      ...calculatedDeposit,
    };
  })
);
