/**
 * tRPC Instance Configuration
 * ===========================
 * This file sets up the tRPC instance and defines reusable procedures.
 *
 * Available Procedures:
 * - publicProcedure: No authentication required
 * - protectedProcedure: Requires authenticated user
 *
 * Usage:
 * Import these procedures to build your API routes
 */

import { initTRPC, TRPCError } from "@trpc/server";
import SuperJSON from "superjson";
import { ZodError } from "zod";
import { createAuthContext } from "../auth/auth-context";
import { requireAuth } from "../auth/auth-utils";

/**
 * Creates the tRPC context for each request
 * This runs before every tRPC procedure
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const authContext = await createAuthContext();

  return {
    ...authContext,
    headers: opts.headers,
  };
};

/**
 * Initialize tRPC with SuperJSON for serialization
 * SuperJSON allows us to pass Dates, Maps, Sets, etc. between client and server
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: SuperJSON,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller
 * Useful for calling tRPC procedures from server components
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * Router constructor
 * Use this to create new routers
 */
export const createTRPCRouter = t.router;

/**
 * Public Procedure
 * ===============
 * Can be called by anyone, authenticated or not
 * Use for: public endpoints, health checks, etc.
 */
export const publicProcedure = t.procedure;

/**
 * Protected Procedure
 * ==================
 * Requires an authenticated user
 * Automatically validates that ctx.user is not null
 * Throws UNAUTHORIZED error if no user is found
 *
 * Use for: user-specific operations
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  requireAuth(ctx.user);

  return next({
    ctx: {
      // Infers that user is non-null
      user: ctx.user,
      session: ctx.session,
    },
  });
});
