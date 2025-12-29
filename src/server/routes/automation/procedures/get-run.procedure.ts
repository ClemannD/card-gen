/**
 * Get Run Procedure
 * =================
 * Returns a single run by ID with full details
 */

import { publicProcedure } from '@/server/trpc/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const getRunProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    const run = await ctx.db.run.findUnique({
      where: { id: input.id },
      include: {
        config: true,
      },
    });

    if (!run) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Run not found',
      });
    }

    return run;
  });
