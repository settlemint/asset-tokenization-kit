import { createQueryClient } from "@/lib/query/query.client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cache, Suspense, type PropsWithChildren, type ReactNode } from "react";

export const getQueryClient = cache(createQueryClient);

export async function HydrateClient({
  children,
  fallback,
}: PropsWithChildren<{
  fallback?: ReactNode;
}>) {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </HydrationBoundary>
  );
}
