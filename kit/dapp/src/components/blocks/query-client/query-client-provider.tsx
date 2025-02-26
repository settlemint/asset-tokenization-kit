'use client';

import {
  type QueryClient,
  QueryClientProvider as ReactQueryClientProvider,
  isServer,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { PropsWithChildren } from 'react';
import { makeQueryClient } from './query-client';

let browserQueryClient: QueryClient | undefined;

/**
 * Gets or creates a QueryClient instance.
 * @returns A QueryClient instance.
 */
function getQueryClient(): QueryClient {
  if (isServer) {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

/**
 * Provides a QueryClient context for the application.
 * @param props - The component props.
 * @returns The QueryClientProvider component.
 */
export function QueryClientProvider({ children }: PropsWithChildren) {
  const queryClient = getQueryClient();

  return (
    <ReactQueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </ReactQueryClientProvider>
  );
}
