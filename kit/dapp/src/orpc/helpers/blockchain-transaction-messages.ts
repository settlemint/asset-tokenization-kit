import type { TOptions } from "i18next";
import type { i18nContext } from "@/orpc/middlewares/i18n/i18n.middleware";

export interface BlockchainTransactionMessages {
  waitingForMining: string;
  transactionFailed: string;
  transactionDropped: string;
  waitingForIndexing: string;
  transactionIndexed: string;
  indexingTimeout: string;
  streamTimeout: string;
}

/**
 * Get standardized blockchain transaction tracking messages
 * These messages are used consistently across all blockchain operations
 *
 * @param t - Translation function from i18n context
 * @param options - Optional translation options
 * @returns Object containing all blockchain transaction messages
 */
export function getBlockchainTransactionMessages(
  t: i18nContext["t"],
  options?: TOptions
): BlockchainTransactionMessages {
  return {
    waitingForMining: t(
      "blockchain:transactions.tracking.waitingForMining",
      options
    ),
    transactionFailed: t(
      "blockchain:transactions.tracking.transactionFailed",
      options
    ),
    transactionDropped: t(
      "blockchain:transactions.tracking.transactionDropped",
      options
    ),
    waitingForIndexing: t(
      "blockchain:transactions.tracking.waitingForIndexing",
      options
    ),
    transactionIndexed: t(
      "blockchain:transactions.tracking.transactionIndexed",
      options
    ),
    indexingTimeout: t(
      "blockchain:transactions.tracking.indexingTimeout",
      options
    ),
    streamTimeout: t("blockchain:transactions.tracking.streamTimeout", options),
  };
}
