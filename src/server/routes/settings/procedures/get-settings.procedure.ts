/**
 * Get Settings Procedure
 * ======================
 * Returns the application settings, creating defaults if none exist
 */

import { publicProcedure } from '@/server/trpc/trpc';

export const getSettingsProcedure = publicProcedure.query(async ({ ctx }) => {
  // Get or create settings
  let settings = await ctx.db.settings.findUnique({
    where: { id: 'default' },
  });

  if (!settings) {
    settings = await ctx.db.settings.create({
      data: { id: 'default' },
    });
  }

  // Mask the API key for display (show last 4 chars only)
  const maskedApiKey = settings.airwallexApiKey
    ? `${'•'.repeat(Math.max(0, settings.airwallexApiKey.length - 4))}${settings.airwallexApiKey.slice(-4)}`
    : '';

  return {
    ...settings,
    airwallexApiKey: maskedApiKey,
    hasApiKey: !!settings.airwallexApiKey,
  };
});

