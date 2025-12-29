/**
 * Settings Router
 * ===============
 * Handles application settings management
 */

import { createTRPCRouter } from '@/server/trpc/trpc';
import { getSettingsProcedure } from './procedures/get-settings.procedure';
import { updateSettingsProcedure } from './procedures/update-settings.procedure';
import { listCardholdersProcedure } from './procedures/list-cardholders.procedure';

export const settingsRouter = createTRPCRouter({
  get: getSettingsProcedure,
  update: updateSettingsProcedure,
  listCardholders: listCardholdersProcedure,
});

