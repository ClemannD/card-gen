/**
 * tRPC React Client
 * =================
 * Client-side tRPC setup with React Query integration
 *
 * Usage:
 * - Wrap your app with <TRPCReactProvider>
 * - Use api.* hooks in your components
 *
 * Example:
 * const { data } = api.notes.list.useQuery();
 * const createNote = api.notes.create.useMutation();
 */

'use client';

import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { loggerLink, httpBatchStreamLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
import SuperJSON from 'superjson';
import { useState } from 'react';
import type { AppRouter } from '@/server/trpc/root';
import { createQueryClient } from './query-client';
import { getBaseUrl, isDevelopment } from '@/lib/env.client';

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return createQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= createQueryClient());
};

/**
 * Create tRPC React hooks
 */
export const api = createTRPCReact<AppRouter>();

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

/**
 * Get base URL for tRPC requests
 */
function getTRPCBaseUrl() {
  return getBaseUrl();
}

/**
 * tRPC React Provider
 * Wraps your app to provide tRPC hooks
 */
export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            isDevelopment() ||
            (op.direction === 'down' && op.result instanceof Error),
        }),
        httpBatchStreamLink({
          transformer: SuperJSON,
          url: getTRPCBaseUrl() + '/api/trpc',
          headers: () => {
            return {
              'x-trpc-source': 'nextjs-react',
            };
          },
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {props.children}
      </api.Provider>
    </QueryClientProvider>
  );
}
