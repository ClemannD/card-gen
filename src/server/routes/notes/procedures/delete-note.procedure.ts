/**
 * Delete Note Procedure
 * =====================
 * Deletes a note by ID
 * Ensures the note belongs to the authenticated user
 */

import { protectedProcedure } from "@/server/trpc/trpc";
import { prisma } from "@/server/prisma";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const deleteNoteProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    // First verify the note exists and belongs to the user
    const existingNote = await prisma.note.findFirst({
      where: {
        id: input.id,
        userId: ctx.user.id,
      },
    });

    if (!existingNote) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Note not found",
      });
    }

    // Delete the note
    await prisma.note.delete({
      where: {
        id: input.id,
      },
    });

    return { success: true };
  });
