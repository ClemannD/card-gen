/**
 * Root tRPC Router
 * ================
 * This is the main application router that combines all feature routers.
 *
 * To add a new router:
 * 1. Import it from src/server/routes/
 * 2. Add it to the router object below
 *
 * Example:
 * import { notesRouter } from "../routes/notes/notes.router";
 *
 * export const appRouter = createTRPCRouter({
 *   notes: notesRouter,
 * });
 */

import { createCallerFactory, createTRPCRouter } from "./trpc";
import { notesRouter } from "../routes/notes/notes.router";
import { accountRouter } from "../routes/account/account.router";

/**
 * Main application router
 * All feature routers are combined here
 */
export const appRouter = createTRPCRouter({
  notes: notesRouter,
  account: accountRouter,
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
