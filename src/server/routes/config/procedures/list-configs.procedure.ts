/**
 * List Configs Procedure
 * ======================
 * Returns all automation configurations
 */

import { publicProcedure } from '@/server/trpc/trpc';

export const listConfigsProcedure = publicProcedure.query(async ({ ctx }) => {
  return ctx.db.config.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { runs: true },
      },
    },
  });
});
