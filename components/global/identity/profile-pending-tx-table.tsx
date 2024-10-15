"use client";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "@/lib/i18n";
import { portalClient, portalGraphql } from "@/lib/settlemint/clientside/portal";
import { shortHex } from "@/lib/utils";
import * as m from "@/paraglide/messages";
import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { AddressHover } from "./hover-address";

const GetPendingTransactions = portalGraphql(`
  query GetPendingTransactions($from: String) {
    getPendingAndRecentlyProcessedTransactions(from: $from) {
      count
      records {
        address
        createdAt
        from
        functionName
        metadata
        transactionHash
        updatedAt
        receipt {
          type
          transactionIndex
          transactionHash
          to
          status
          root
          logsBloom
          logs
          gasUsed
          from
          effectiveGasPrice
          cumulativeGasUsed
          contractAddress
          blockNumber
          blockHash
          blobGasUsed
          blobGasPrice
        }
      }
    }
  }
  `);

export function PendingTxTable({ from, refetchInterval }: { from?: Address; refetchInterval?: number }) {
  const { data: pendingTransactions } = useQuery({
    queryKey: ["pendingandrecenttx", from],
    queryFn: async () => {
      const response = await portalClient.request(GetPendingTransactions, {
        from: from,
      });
      if (!response?.getPendingAndRecentlyProcessedTransactions) {
        return { count: 0, records: [] };
      }
      return response.getPendingAndRecentlyProcessedTransactions;
    },
    refetchInterval: refetchInterval ?? 1000,
  });

  // TODO: replace by our data table component
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{m.alive_grassy_warbler_vent()}</TableHead>
          <TableHead>{m.stale_bald_loris_breathe()}</TableHead>
          <TableHead>{m.white_quaint_halibut_boil()}</TableHead>
          <TableHead>{m.smug_early_gopher_cut()}</TableHead>
          <TableHead>{m.strong_fuzzy_goat_swim()}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(pendingTransactions?.count ?? 0) === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              {m.fair_small_puffin_aid()}
            </TableCell>
          </TableRow>
        )}
        {(pendingTransactions?.records ?? []).map((transaction) => (
          <TableRow key={transaction.transactionHash}>
            <TableCell>{transaction.functionName}</TableCell>
            <TableCell className="font-mono">
              <AddressHover address={transaction.from} />
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  transaction.receipt === null
                    ? "secondary"
                    : transaction.receipt.status === "Success"
                      ? "default"
                      : "destructive"
                }
              >
                {transaction.receipt === null
                  ? m.bright_true_kitten_sew()
                  : transaction.receipt.status === "Success"
                    ? m.vexed_mild_shrike_hunt()
                    : m.white_weak_giraffe_intend()}
              </Badge>
            </TableCell>
            <TableCell className="font-mono">
              {/* TODO: use the explorer from the env vars, might need to be asked about in connect. For mainnets we need to ask which etherscan variant to use */}
              <Link
                prefetch={false}
                href={`https://amoy.polygonscan.com/tx/${transaction.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline truncate max-w-[70%] text-primary"
              >
                {shortHex(transaction.transactionHash)}
              </Link>
            </TableCell>
            <TableCell>
              {typeof transaction.createdAt === "string" ? new Date(transaction.createdAt).toLocaleString() : "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
