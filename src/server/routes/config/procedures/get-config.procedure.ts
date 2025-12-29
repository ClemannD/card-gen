/**
 * Get Config Procedure
 * ====================
 * Returns a single configuration by ID
 */

import { publicProcedure } from '@/server/trpc/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const getConfigProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    const config = await ctx.db.config.findUnique({
      where: { id: input.id },
      include: {
        runs: {
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!config) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Config not found',
      });
    }

    return config;
  });
