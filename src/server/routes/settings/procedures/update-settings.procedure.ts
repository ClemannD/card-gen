/**
 * Update Settings Procedure
 * =========================
 * Updates the application settings
 */

import { publicProcedure } from '@/server/trpc/trpc';
import { z } from 'zod';

export const updateSettingsProcedure = publicProcedure
  .input(
    z.object({
      airwallexClientId: z.string().optional(),
      airwallexApiKey: z.string().optional(),
      airwallexEnv: z.enum(['demo', 'prod']).optional(),
      airwallexCardholderId: z.string().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Build update data, only including provided fields
    const updateData: Record<string, string> = {};

    if (input.airwallexClientId !== undefined) {
      updateData.airwallexClientId = input.airwallexClientId;
    }
    if (input.airwallexApiKey !== undefined) {
      updateData.airwallexApiKey = input.airwallexApiKey;
    }
    if (input.airwallexEnv !== undefined) {
      updateData.airwallexEnv = input.airwallexEnv;
    }
    if (input.airwallexCardholderId !== undefined) {
      updateData.airwallexCardholderId = input.airwallexCardholderId;
    }

    // Upsert settings
    const settings = await ctx.db.settings.upsert({
      where: { id: 'default' },
      update: updateData,
      create: {
        id: 'default',
        ...updateData,
      },
    });

    return { success: true, updatedAt: settings.updatedAt };
  });

