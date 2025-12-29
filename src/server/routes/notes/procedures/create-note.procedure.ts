/**
 * Create Note Procedure
 * =====================
 * Creates a new note for the authenticated user
 */

import { protectedProcedure } from "@/server/trpc/trpc";
import { prisma } from "@/server/prisma";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";

export const createNoteProcedure = protectedProcedure
  .input(
    z.object({
      title: z.string().min(1, "Title is required").max(255),
      content: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const note = await prisma.note.create({
      data: {
        id: createId(),
        title: input.title,
        content: input.content,
        userId: ctx.user.id,
      },
    });

    return note;
  });
