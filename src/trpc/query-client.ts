/**
 * Shared Query Client Configuration
 * =================================
 * Creates a shared QueryClient instance with SuperJSON serialization
 * Used by both client-side and server-side tRPC
 */

import {
  QueryClient,
  defaultShouldDehydrateQuery,
} from '@tanstack/react-query';
import SuperJSON from 'superjson';

/**
 * Creates a new QueryClient with optimized settings for SSR
 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000, // 30 seconds
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });
