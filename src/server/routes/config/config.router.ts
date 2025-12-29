/**
 * Config Router
 * =============
 * Handles CRUD operations for automation configurations
 */

import { createTRPCRouter } from "@/server/trpc/trpc";
import { listConfigsProcedure } from "./procedures/list-configs.procedure";
import { getConfigProcedure } from "./procedures/get-config.procedure";
import { createConfigProcedure } from "./procedures/create-config.procedure";
import { updateConfigProcedure } from "./procedures/update-config.procedure";
import { deleteConfigProcedure } from "./procedures/delete-config.procedure";

export const configRouter = createTRPCRouter({
  list: listConfigsProcedure,
  get: getConfigProcedure,
  create: createConfigProcedure,
  update: updateConfigProcedure,
  delete: deleteConfigProcedure,
});

