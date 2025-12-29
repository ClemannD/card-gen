/**
 * Create Config Procedure
 * =======================
 * Creates a new automation configuration
 */

import { publicProcedure } from '@/server/trpc/trpc';
import { z } from 'zod';

export const createConfigProcedure = publicProcedure
  .input(
    z.object({
      name: z.string().min(1, 'Name is required'),
      settings: z.record(z.unknown()).default({}),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return ctx.db.config.create({
      data: {
        name: input.name,
        settings: JSON.stringify(input.settings),
      },
    });
  });
