/**
 * tRPC Instance Configuration
 * ===========================
 * This file sets up the tRPC instance and defines reusable procedures.
 *
 * Available Procedures:
 * - publicProcedure: Used for all operations (no auth needed for local tool)
 */

import { initTRPC } from "@trpc/server";
import SuperJSON from "superjson";
import { ZodError } from "zod";
import { prisma } from "../prisma";

/**
 * Creates the tRPC context for each request
 * Provides database access to all procedures
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    db: prisma,
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
 * Used for all operations since this is a local-only tool
 */
export const publicProcedure = t.procedure;
