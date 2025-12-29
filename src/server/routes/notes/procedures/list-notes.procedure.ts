/**
 * List Notes Procedure
 * ====================
 * Returns all notes for the authenticated user
 * Results are ordered by creation date (newest first)
 */

import { protectedProcedure } from "@/server/trpc/trpc";
import { prisma } from "@/server/prisma";

export const listNotesProcedure = protectedProcedure.query(async ({ ctx }) => {
  const notes = await prisma.note.findMany({
    where: {
      userId: ctx.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return notes;
});
