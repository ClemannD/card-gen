/**
 * Delete Config Procedure
 * =======================
 * Deletes an automation configuration and its runs
 */

import { publicProcedure } from '@/server/trpc/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const deleteConfigProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const existing = await ctx.db.config.findUnique({
      where: { id: input.id },
    });

    if (!existing) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Config not found',
      });
    }

    return ctx.db.config.delete({
      where: { id: input.id },
    });
  });
