/**
 * tRPC Server Caller
 * ==================
 * Server-side tRPC caller for React Server Components
 *
 * Usage in Server Components:
 * import { api } from "@/trpc/server";
 *
 * const notes = await api.notes.list();
 */

import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { createCaller } from "@/server/trpc/root";
import { createTRPCContext } from "@/server/trpc/trpc";

/**
 * Creates a server-side tRPC context
 * Cached per request to avoid re-creating context
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

/**
 * Server-side tRPC caller
 * Use this to call procedures directly from server components
 */
export const api = createCaller(createContext);
