import { orpc } from "@/orpc/orpc-client";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import type { QueryClient } from "@tanstack/react-query";

interface InvalidateTokenActionQueriesOptions {
  tokenAddress: EthereumAddress;
  holderAddresses?: EthereumAddress[];
  includeUserAssets?: boolean;
}

export async function invalidateTokenActionQueries(
  queryClient: QueryClient,
  {
    tokenAddress,
    holderAddresses = [],
    includeUserAssets = false,
  }: InvalidateTokenActionQueriesOptions
) {
  const tasks: Promise<unknown>[] = [
    queryClient.invalidateQueries({
      queryKey: orpc.actions.list.queryOptions({ input: {} }).queryKey,
    }),
    queryClient.invalidateQueries({
      queryKey: orpc.actions.list.queryOptions({ input: { status: "PENDING" } })
        .queryKey,
    }),
    queryClient.invalidateQueries({
      queryKey: orpc.actions.list.queryOptions({
        input: {
          name: "ClaimYield",
        },
      }).queryKey,
    }),
    queryClient.invalidateQueries({
      queryKey: orpc.actions.list.queryOptions({
        input: { targets: [tokenAddress] },
      }).queryKey,
    }),
    queryClient.invalidateQueries({
      queryKey: orpc.token.read.queryOptions({
        input: { tokenAddress },
      }).queryKey,
    }),
  ];

  if (includeUserAssets) {
    tasks.push(
      queryClient.invalidateQueries({
        queryKey: orpc.user.assets.queryKey(),
      })
    );
  }

  holderAddresses.forEach((address) => {
    if (!address) return;

    tasks.push(
      queryClient.invalidateQueries({
        queryKey: orpc.token.holder.queryKey({
          input: {
            tokenAddress,
            holderAddress: address,
          },
        }),
      })
    );
  });

  await Promise.all(tasks);
}
