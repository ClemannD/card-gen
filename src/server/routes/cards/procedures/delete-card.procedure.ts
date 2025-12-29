/**
 * Delete Card Procedure
 * =====================
 * Deletes a card from the database
 */

import { publicProcedure } from '@/server/trpc/trpc';
import { z } from 'zod';

export const deleteCardProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    await ctx.db.card.delete({
      where: { id: input.id },
    });

    return { success: true };
  });

