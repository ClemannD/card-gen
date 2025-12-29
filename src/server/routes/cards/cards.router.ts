/**
 * Cards Router
 * ============
 * Handles card creation and management via Airwallex API
 */

import { createTRPCRouter } from '@/server/trpc/trpc';
import { createCardsProcedure } from './procedures/create-cards.procedure';
import { listCardsProcedure } from './procedures/list-cards.procedure';
import { deleteCardProcedure } from './procedures/delete-card.procedure';

export const cardsRouter = createTRPCRouter({
  create: createCardsProcedure,
  list: listCardsProcedure,
  delete: deleteCardProcedure,
});

