/**
 * Run Script Procedure
 * ====================
 * Executes an automation script with the given configuration
 */

import { publicProcedure } from '@/server/trpc/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  runAutomation,
  airwallexCardScript,
  type OutputCollector,
  type AirwallexConfig,
} from '@/automation/runner';
import type { Page } from 'playwright';

// Schema for validating Airwallex config settings
const airwallexConfigSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
  cardAmount: z.number().positive('Card amount must be positive'),
  numberOfCards: z
    .number()
    .int()
    .positive('Number of cards must be a positive integer'),
  dryRun: z.boolean().optional().default(false),
});

export const runScriptProcedure = publicProcedure
  .input(
    z.object({
      configId: z.string(),
      headless: z.boolean().default(false),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Get the config
    const config = await ctx.db.config.findUnique({
      where: { id: input.configId },
    });

    if (!config) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Config not found',
      });
    }

    // Parse settings
    let settings: Record<string, unknown> = {};
    try {
      settings = JSON.parse(config.settings) as Record<string, unknown>;
    } catch {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid config settings JSON',
      });
    }

    // Validate settings against Airwallex config schema
    const validationResult = airwallexConfigSchema.safeParse(settings);
    if (!validationResult.success) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Invalid config settings: ${validationResult.error.message}`,
      });
    }

    const airwallexConfig: AirwallexConfig = validationResult.data;

    // Create run record
    const run = await ctx.db.run.create({
      data: {
        configId: input.configId,
        status: 'running',
        output: '',
      },
    });

    try {
      // Run the Airwallex automation
      const result = await runAutomation(
        async (page: Page, collector: OutputCollector) => {
          collector.log(`Running with config: ${config.name}`);
          collector.log(`Email: ${airwallexConfig.email}`);
          collector.log(`Cards to create: ${airwallexConfig.numberOfCards}`);
          collector.log(`Amount per card: ${airwallexConfig.cardAmount}`);
          collector.log(
            `Dry run mode: ${airwallexConfig.dryRun ? 'ENABLED' : 'disabled'}`,
          );

          // Run the Airwallex card creation script
          await airwallexCardScript(page, collector, airwallexConfig);
        },
        { headless: input.headless, authEmail: airwallexConfig.email },
      );

      // Update run record
      const updatedRun = await ctx.db.run.update({
        where: { id: run.id },
        data: {
          status: result.success ? 'success' : 'error',
          output: result.output,
          error: result.error,
          endedAt: new Date(),
        },
      });

      return updatedRun;
    } catch (error) {
      // Update run record with error
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const updatedRun = await ctx.db.run.update({
        where: { id: run.id },
        data: {
          status: 'error',
          error: errorMessage,
          endedAt: new Date(),
        },
      });

      return updatedRun;
    }
  });
