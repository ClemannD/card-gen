/**
 * List Cardholders Procedure
 * ==========================
 * Fetches cardholders from the Airwallex API
 */

import { publicProcedure } from '@/server/trpc/trpc';
import { listCardholders } from '@/server/services/airwallex';
import { z } from 'zod';

export const listCardholdersProcedure = publicProcedure
  .input(
    z
      .object({
        page: z.number().min(0).default(0),
        pageSize: z.number().min(1).max(100).default(50),
      })
      .optional(),
  )
  .query(async ({ input }) => {
    const page = input?.page ?? 0;
    const pageSize = input?.pageSize ?? 50;

    const response = await listCardholders(page, pageSize);

    return {
      cardholders: response.items.map((ch) => ({
        id: ch.cardholder_id,
        firstName: ch.individual?.first_name ?? '',
        lastName: ch.individual?.last_name ?? '',
        email: ch.email ?? '',
        status: ch.status,
        createdAt: ch.created_at,
      })),
      hasMore: response.has_more,
      page,
      pageSize,
    };
  });

