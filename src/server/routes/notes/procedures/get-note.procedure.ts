/**
 * Get Note Procedure
 * ==================
 * Retrieves a specific note by ID
 * Ensures the note belongs to the authenticated user
 */

import { protectedProcedure } from "@/server/trpc/trpc";
import { prisma } from "@/server/prisma";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const getNoteProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .query(async ({ ctx, input }) => {
    const note = await prisma.note.findFirst({
      where: {
        id: input.id,
        userId: ctx.user.id, // Ensure user owns this note
      },
    });

    if (!note) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Note not found",
      });
    }

    return note;
  });
