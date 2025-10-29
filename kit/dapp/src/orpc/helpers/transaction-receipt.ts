import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { logger } from "better-auth";
import { z } from "zod";

const GET_TRANSACTION_RECEIPT_QUERY = portalGraphql(`
  query GetTransactionReceipt($transactionHash: String!) {
    getTransaction(transactionHash: $transactionHash) {
      receipt {
        logs
        contractAddress
        status
      }
    }
  }
`);

const RECEIPT_SCHEMA = z.object({
  getTransaction: z.object({
    receipt: z.object({
      logs: z.any(), // logs is JSON type in Portal
      contractAddress: z.string().nullable(),
      status: z.enum(["Success", "Reverted"]),
    }),
  }),
});

export async function getTransactionReceipt(transactionHash: string) {
  try {
    const receipt = await portalClient.request(GET_TRANSACTION_RECEIPT_QUERY, {
      transactionHash,
    });
    const parsed = RECEIPT_SCHEMA.parse(receipt);
    return parsed.getTransaction.receipt;
  } catch (error) {
    // Log the actual error for debugging
    logger.error("Getting transaction receipt failed:", error);
    throw new Error(
      `Portal query failed: ${error instanceof Error ? error.message : String(error)}`,
      {
        cause: error,
      }
    );
  }
}
