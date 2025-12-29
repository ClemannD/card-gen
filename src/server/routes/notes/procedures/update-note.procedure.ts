/**
 * Update Note Procedure
 * =====================
 * Updates an existing note
 * Ensures the note belongs to the authenticated user
 */

import { protectedProcedure } from "@/server/trpc/trpc";
import { prisma } from "@/server/prisma";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const updateNoteProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      title: z.string().min(1, "Title is required").max(255).optional(),
      content: z.string().optional(),
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

    // Update the note
    const note = await prisma.note.update({
      where: {
        id: input.id,
      },
      data: {
        title: input.title,
        content: input.content,
      },
    });

    return note;
  });
