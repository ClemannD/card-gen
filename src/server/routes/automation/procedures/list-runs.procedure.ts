/**
 * List Runs Procedure
 * ===================
 * Returns a list of automation runs, optionally filtered by config
 */

import { publicProcedure } from '@/server/trpc/trpc';
import { z } from 'zod';

export const listRunsProcedure = publicProcedure
  .input(
    z
      .object({
        configId: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
      })
      .default({}),
  )
  .query(async ({ ctx, input }) => {
    return ctx.db.run.findMany({
      where: input.configId ? { configId: input.configId } : undefined,
      orderBy: { startedAt: 'desc' },
      take: input.limit,
      include: {
        config: {
          select: { name: true },
        },
      },
    });
  });
