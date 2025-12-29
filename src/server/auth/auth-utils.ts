/**
 * Auth Validation Utilities
 * =========================
 * Helper functions for validating authentication state in tRPC procedures.
 * These utilities throw appropriate errors when auth requirements aren't met.
 *
 * Usage:
 * - Import and call in protected procedures to validate auth state
 * - Throws TRPCError with appropriate codes for proper HTTP status codes
 */

import { TRPCError } from "@trpc/server";
import type { Session } from "@/lib/auth";

/**
 * Ensures a user is authenticated
 * Throws UNAUTHORIZED error if no user is found
 */
export function requireAuth(
  user: Session["user"] | null
): asserts user is NonNullable<Session["user"]> {
  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });
  }
}

/**
 * Checks if user is authenticated (boolean check)
 */
export function isAuthenticated(user: Session["user"] | null): user is NonNullable<Session["user"]> {
  return user !== null;
}

/**
 * Gets user display name from user object
 * Falls back to email if name is not set
 */
export function getUserDisplayName(user: Session["user"]): string {
  return user.name || user.email;
}
