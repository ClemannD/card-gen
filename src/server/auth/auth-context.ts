/**
 * Auth Context Creation
 * =====================
 * This module provides a shared authentication context for tRPC procedures.
 * It retrieves the current user session from better-auth.
 *
 * Usage in tRPC:
 * - Called by createTRPCContext to provide auth data to all procedures
 * - Returns user session information or null if not authenticated
 */

import { auth, type Session } from "@/lib/auth";
import { headers } from "next/headers";

export interface AuthContext {
  session: Session["session"] | null;
  user: Session["user"] | null;
}

/**
 * Creates an authentication context by fetching the current session
 * This function is called for every tRPC request
 */
export async function createAuthContext(): Promise<AuthContext> {
  try {
    // Get session from better-auth using request headers
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return {
      session: session?.session ?? null,
      user: session?.user ?? null,
    };
  } catch (error) {
    // If session retrieval fails, return null values
    console.error("Failed to get session:", error);
    return {
      session: null,
      user: null,
    };
  }
}
