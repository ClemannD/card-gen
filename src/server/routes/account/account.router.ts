/**
 * Account Router
 * ==============
 * Handles account-related operations like getting user profile
 *
 * Naming Convention:
 * - Files: kebab-case (get-user.procedure.ts)
 * - Exports: camelCase (getUserProcedure)
 */

import { createTRPCRouter } from "@/server/trpc/trpc";
import { getUserProcedure } from "./procedures/get-user.procedure";

export const accountRouter = createTRPCRouter({
  getUser: getUserProcedure,
});
