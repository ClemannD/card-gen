/**
 * Get User Procedure
 * ==================
 * Returns the current authenticated user's information
 */

import { protectedProcedure } from "@/server/trpc/trpc";

export const getUserProcedure = protectedProcedure.query(async ({ ctx }) => {
  return {
    id: ctx.user.id,
    name: ctx.user.name,
    email: ctx.user.email,
    emailVerified: ctx.user.emailVerified,
    image: ctx.user.image,
    createdAt: ctx.user.createdAt,
  };
});
