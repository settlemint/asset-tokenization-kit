import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * TypeBox schema for transaction data
 *
 * Provides validation for transaction information including:
 * from address, function name, transaction hash, and receipt details
 */
export const TransactionSchema = t.Object(
  {
    from: t.EthereumAddress({
      description: "The address that initiated the transaction",
    }),
    functionName: t.String({
      description: "The name of the function called in the transaction",
    }),
    transactionHash: t.Hash({
      description: "The hash of the transaction",
    }),
    updatedAt: t.Date({
      description: "The timestamp when the transaction was last updated",
    }),
    address: t.EthereumAddress({
      description: "The contract address the transaction interacted with",
    }),
    createdAt: t.Date({
      description: "The timestamp when the transaction was created",
    }),
    metadata: t.MaybeEmpty(
      t.Record(t.String(), t.Any(), {
        description: "Additional metadata about the transaction",
      })
    ),
    receipt: t.MaybeEmpty(
      t.Object(
        {
          status: t.String({
            description: "The status of the transaction (success/failure)",
          }),
          revertReasonDecoded: t.MaybeEmpty(
            t.String({
              description: "The decoded reason if the transaction reverted",
            })
          ),
          blockNumber: t.String({
            description:
              "The block number in which the transaction was included",
          }),
          gasUsed: t.StringifiedBigInt({
            description: "The amount of gas used by the transaction",
          }),
          blobGasPrice: t.MaybeEmpty(
            t.StringifiedBigInt({
              description: "The price of blob gas for the transaction",
            })
          ),
          blobGasUsed: t.MaybeEmpty(
            t.StringifiedBigInt({
              description: "The amount of blob gas used by the transaction",
            })
          ),
          blockHash: t.Hash({
            description: "The hash of the block containing the transaction",
          }),
          contractAddress: t.MaybeEmpty(
            t.EthereumAddress({
              description: "The address of the created contract, if any",
            })
          ),
          cumulativeGasUsed: t.StringifiedBigInt({
            description:
              "The total gas used when this transaction was executed in the block",
          }),
          effectiveGasPrice: t.StringifiedBigInt({
            description: "The effective gas price for the transaction",
          }),
          from: t.EthereumAddress({
            description: "The sender of the transaction",
          }),
          logs: t.Array(
            t.Any({
              description: "An individual log entry",
            }),
            {
              description:
                "The logs generated during the transaction execution",
            }
          ),
          logsBloom: t.String({
            description:
              "A bloom filter of logs/events generated during transaction execution",
          }),
          revertReason: t.MaybeEmpty(
            t.String({
              description:
                "The reason for transaction reversion, if applicable",
            })
          ),
          root: t.MaybeEmpty(
            t.String({
              description:
                "The root of the state trie after transaction execution",
            })
          ),
          to: t.MaybeEmpty(
            t.EthereumAddress({
              description: "The recipient address of the transaction",
            })
          ),
          transactionHash: t.Hash({
            description: "The hash of the transaction",
          }),
          transactionIndex: t.Number({
            description: "The index of the transaction in the block",
          }),
          type: t.String({
            description: "The type of the transaction",
          }),
        },
        {
          description:
            "Information about the blockchain receipt for the transaction",
        }
      )
    ),
  },
  {
    description:
      "Transaction data including sender, contract interaction, and blockchain details",
  }
);
export type Transaction = StaticDecode<typeof TransactionSchema>;

export const TransactionTimelineSchema = t.Object(
  {
    timestamp: t.String({
      description: "The timestamp for this timeline point",
    }),
    transaction: t.Number({
      description: "The number of transactions in this time period",
    }),
  },
  {
    description: "Data point for transaction timeline visualization",
  }
);
export type TransactionTimeline = StaticDecode<
  typeof TransactionTimelineSchema
>;
