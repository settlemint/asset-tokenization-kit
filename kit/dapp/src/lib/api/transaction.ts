import { defaultErrorSchema } from "@/lib/api/default-error-schema";
import { getTransactionDetail } from "@/lib/queries/transactions/transaction-detail";
import {
  getTransactionList,
  getTransactionListByAddress,
} from "@/lib/queries/transactions/transaction-list";
import { TransactionSchema } from "@/lib/queries/transactions/transaction-schema";
import { getRecentTransactions } from "@/lib/queries/transactions/transactions-recent";
import { getTransactionsTimeline } from "@/lib/queries/transactions/transactions-timeline";
import { betterAuth, superJson } from "@/lib/utils/elysia";
import { t } from "@/lib/utils/typebox";
import { Elysia } from "elysia";
import { getAddress } from "viem";

export const TransactionApi = new Elysia()
  .use(betterAuth)
  .use(superJson)
  .get(
    "/",
    async () => {
      return getTransactionList();
    },
    {
      auth: true,
      detail: {
        summary: "List",
        description: "Retrieves a list of all transactions in the system.",
        tags: ["transaction"],
      },
      response: {
        200: t.Array(TransactionSchema),
        ...defaultErrorSchema,
      },
    }
  )
  .get(
    "/address/:address",
    ({ params: { address } }) => {
      return getTransactionListByAddress(getAddress(address));
    },
    {
      auth: true,
      detail: {
        summary: "List by Address",
        description: "Retrieves a list of transactions for a specific address.",
        tags: ["transaction"],
      },
      params: t.Object({
        address: t.String({
          description: "The Ethereum address to get transactions for",
        }),
      }),
      response: {
        200: t.Array(TransactionSchema),
        ...defaultErrorSchema,
      },
    }
  )
  .get(
    "/:transactionHash",
    ({ params: { transactionHash } }) => {
      return getTransactionDetail({
        transactionHash,
      });
    },
    {
      auth: true,
      detail: {
        summary: "Details",
        description:
          "Retrieves details for a specific transaction identified by its hash.",
        tags: ["transaction"],
      },
      params: t.Object({
        transactionHash: t.String({
          description: "The hash of the transaction",
        }),
      }),
      response: {
        200: t.Union([TransactionSchema, t.Null()]),
        ...defaultErrorSchema,
      },
    }
  )
  .get(
    "/recent",
    async ({ query }) => {
      const { address, processedAfter } = query;
      return getRecentTransactions({
        address: address ? getAddress(address) : undefined,
        processedAfter: processedAfter ? new Date(processedAfter) : undefined,
      });
    },
    {
      auth: true,
      detail: {
        summary: "Recent Transactions",
        description:
          "Retrieves recent transactions, optionally filtered by address and date.",
        tags: ["transaction"],
      },
      query: t.Object({
        address: t.Optional(
          t.String({
            description: "The Ethereum address to filter transactions for",
          })
        ),
        processedAfter: t.Optional(
          t.String({
            description:
              "ISO date string to filter transactions processed after this date",
          })
        ),
      }),
      response: {
        200: t.Array(TransactionSchema),
        ...defaultErrorSchema,
      },
    }
  )
  .get(
    "/count",
    async ({ query }) => {
      const { address } = query;
      const transactions = address
        ? await getTransactionListByAddress(getAddress(address))
        : await getTransactionList();

      const recent = await getRecentTransactions({
        address: address ? getAddress(address) : undefined,
        processedAfter: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      });

      return {
        total: transactions.length,
        recent: recent.length,
      };
    },
    {
      auth: true,
      detail: {
        summary: "Transaction Counts",
        description:
          "Retrieves transaction counts, total and recent (last 24 hours).",
        tags: ["transaction"],
      },
      query: t.Object({
        address: t.Optional(
          t.String({
            description: "The Ethereum address to filter transactions for",
          })
        ),
      }),
      response: {
        200: t.Object({
          total: t.Number({
            description: "The total number of transactions",
          }),
          recent: t.Number({
            description: "The number of transactions in the last 24 hours",
          }),
        }),
        ...defaultErrorSchema,
      },
    }
  )
  .get(
    "/timeline",
    async ({ query }) => {
      const { address, startDate, granularity } = query;

      return getTransactionsTimeline({
        from: address ? getAddress(address) : undefined,
        timelineStartDate: new Date(startDate),
        granularity: granularity,
      });
    },
    {
      auth: true,
      detail: {
        summary: "Transaction Timeline",
        description: "Retrieves transaction timeline data for visualization.",
        tags: ["transaction"],
      },
      query: t.Object({
        address: t.Optional(
          t.String({
            description: "The Ethereum address to filter transactions for",
          })
        ),
        startDate: t.String({
          description: "ISO date string for the start of the timeline",
        }),
        granularity: t.UnionEnum(["HOUR", "DAY", "MONTH", "YEAR"], {
          description:
            "The granularity of the timeline (HOUR, DAY, MONTH, YEAR)",
        }),
      }),
      response: {
        200: t.Array(
          t.Object({
            timestamp: t.String({
              description: "The timestamp for this data point",
            }),
            transaction: t.Number({
              description: "The number of transactions in this period",
            }),
          })
        ),
        ...defaultErrorSchema,
      },
    }
  );
