/**
 * Automation Router
 * =================
 * Handles automation script execution and run history
 */

import { createTRPCRouter } from "@/server/trpc/trpc";
import { runScriptProcedure } from "./procedures/run-script.procedure";
import { listRunsProcedure } from "./procedures/list-runs.procedure";
import { getRunProcedure } from "./procedures/get-run.procedure";

export const automationRouter = createTRPCRouter({
  run: runScriptProcedure,
  listRuns: listRunsProcedure,
  getRun: getRunProcedure,
});

