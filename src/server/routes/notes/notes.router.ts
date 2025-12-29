/**
 * Notes Router
 * ============
 * Handles all note-related CRUD operations
 *
 * Available Operations:
 * - list: Get all notes for the current user
 * - get: Get a specific note by ID
 * - create: Create a new note
 * - update: Update an existing note
 * - delete: Delete a note
 *
 * All operations are protected and require authentication
 */

import { createTRPCRouter } from "@/server/trpc/trpc";
import { listNotesProcedure } from "./procedures/list-notes.procedure";
import { getNoteProcedure } from "./procedures/get-note.procedure";
import { createNoteProcedure } from "./procedures/create-note.procedure";
import { updateNoteProcedure } from "./procedures/update-note.procedure";
import { deleteNoteProcedure } from "./procedures/delete-note.procedure";

export const notesRouter = createTRPCRouter({
  list: listNotesProcedure,
  get: getNoteProcedure,
  create: createNoteProcedure,
  update: updateNoteProcedure,
  delete: deleteNoteProcedure,
});
