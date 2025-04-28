import { portalGraphql } from "@/lib/settlemint/portal";
import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";
import { t, type StaticDecode } from "@/lib/utils/typebox";

export const ReceiptFragment = portalGraphql(`
  fragment ReceiptFragment on TransactionReceiptOutput {
      revertReasonDecoded
      gasUsed
      blobGasPrice
      blobGasUsed
      blockHash
      blockNumber
      contractAddress
      cumulativeGasUsed
      effectiveGasPrice
      from
      logs
      logsBloom
      revertReason
      root
      status
      to
      transactionHash
      transactionIndex
      type
  }
`);

export const ReceiptFragmentSchema = t.Object({
  status: t.String({
    description: "The status of the transaction (success/failure)",
  }),
  revertReasonDecoded: t.MaybeEmpty(
    t.String({
      description: "The decoded reason if the transaction reverted",
    })
  ),
  blockNumber: t.String({
    description: "The block number in which the transaction was included",
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
      description: "The logs generated during the transaction execution",
    }
  ),
  logsBloom: t.String({
    description:
      "A bloom filter of logs/events generated during transaction execution",
  }),
  revertReason: t.MaybeEmpty(
    t.String({
      description: "The reason for transaction reversion, if applicable",
    })
  ),
  root: t.MaybeEmpty(
    t.String({
      description: "The root of the state trie after transaction execution",
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
});

export type Receipt = StaticDecode<typeof ReceiptFragmentSchema>;

// Add a Check function if it's referenced but not defined
const Check = (value: any): boolean => {
  return value !== null && value !== undefined;
};

/**
 * GraphQL fragment for transaction data
 *
 * @remarks
 * Contains basic transaction information from the Portal API
 */
export const TransactionFragment = portalGraphql(
  `
  fragment TransactionFragment on TransactionOutput {
    address
    createdAt
    from
    functionName
    metadata
    transactionHash
    updatedAt
    receipt {
      ...ReceiptFragment
    }
  }
`,
  [ReceiptFragment]
);

/**
 * TypeBox schema for validating transaction data
 *
 */
export const TransactionFragmentSchema = t.Object({
  from: t.EthereumAddress({
    description: "The address that initiated the transaction",
  }),
  functionName: t.String({
    description: "The name of the function called in the transaction",
  }),
  transactionHash: t.Hash({
    description: "The hash of the transaction",
  }),
  updatedAt: t.Union([
    t.Date({
      description:
        "The timestamp when the transaction was last updated as Date object",
    }),
    t.String({
      description:
        "The timestamp when the transaction was last updated as ISO string",
    }),
  ]),
  receipt: t.MaybeEmpty(ReceiptFragmentSchema),
  address: t.EthereumAddress({
    description: "The contract address the transaction interacted with",
  }),
  createdAt: t.Union([
    t.Date({
      description:
        "The timestamp when the transaction was created as Date object",
    }),
    t.String({
      description:
        "The timestamp when the transaction was created as ISO string",
    }),
  ]),
  metadata: t.MaybeEmpty(
    t.Record(t.String(), t.Any(), {
      description: "Additional metadata about the transaction",
    })
  ),
});

/**
 * Type definition for transaction data
 */
export type Transaction = StaticDecode<typeof TransactionFragmentSchema>;

export const IndexingFragment = theGraphGraphqlKit(`
  fragment IndexingFragment on _Block_ {
    number
  }
`);

export const IndexingFragmentSchema = t.Object({
  number: t.Number({
    description: "The block number",
  }),
});

export type IndexingFragmentType = StaticDecode<typeof IndexingFragmentSchema>;
