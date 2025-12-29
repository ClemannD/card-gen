/**
 * Root tRPC Router
 * ================
 * This is the main application router that combines all feature routers.
 *
 * To add a new router:
 * 1. Import it from src/server/routes/
 * 2. Add it to the router object below
 */

import { createCallerFactory, createTRPCRouter } from './trpc';
import { configRouter } from '../routes/config/config.router';
import { automationRouter } from '../routes/automation/automation.router';
import { cardsRouter } from '../routes/cards/cards.router';
import { settingsRouter } from '../routes/settings/settings.router';

/**
 * Main application router
 * All feature routers are combined here
 */
export const appRouter = createTRPCRouter({
  config: configRouter,
  automation: automationRouter,
  cards: cardsRouter,
  settings: settingsRouter,
});

/**
 * Type definition for the router
 * This is used for type inference on the client
 */
export type AppRouter = typeof appRouter;

/**
 * Server-side caller factory
 * Use this to call tRPC procedures from server components
 */
export const createCaller = createCallerFactory(appRouter);
