import { makeQueryClient } from "@/lib/orpc/query/query.client";
import {
  dehydrate,
  HydrationBoundary,
  type FetchQueryOptions,
} from "@tanstack/react-query";
import {
  Fragment,
  Suspense,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { ErrorBoundary } from "react-error-boundary";

type AwaitProps<TData = unknown, TError = Error> = PropsWithChildren<{
  queryOptions:
    | FetchQueryOptions<TData, TError>
    | FetchQueryOptions<TData, TError>[];
  error?: ReactNode;
  fallback?: ReactNode;
}>;

export async function Await<TData = unknown, TError = Error>({
  children,
  queryOptions,
  error,
  fallback,
}: AwaitProps<TData, TError>) {
  const queryClient = makeQueryClient();

  // Handle both single and multiple queries
  const queries = Array.isArray(queryOptions) ? queryOptions : [queryOptions];

  // Prefetch all queries in parallel
  await Promise.all(queries.map((query) => queryClient.prefetchQuery(query)));

  const MaybeErrorBoundary = error ? ErrorBoundary : Fragment;

  return (
    <MaybeErrorBoundary fallback={error}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={fallback}>{children}</Suspense>
      </HydrationBoundary>
    </MaybeErrorBoundary>
  );
}
