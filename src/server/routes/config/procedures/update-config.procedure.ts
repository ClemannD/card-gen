/**
 * Update Config Procedure
 * =======================
 * Updates an existing automation configuration
 */

import { publicProcedure } from '@/server/trpc/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const updateConfigProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().min(1, 'Name is required').optional(),
      settings: z.record(z.unknown()).optional(),
    }),
  )
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

    return ctx.db.config.update({
      where: { id: input.id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.settings && { settings: JSON.stringify(input.settings) }),
      },
    });
  });
