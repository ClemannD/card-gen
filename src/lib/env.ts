/**
 * Environment Variable Validation
 * ===============================
 * Validates and provides type-safe access to environment variables.
 *
 * This module ensures all required environment variables are present
 * and properly typed at application startup, preventing runtime errors.
 *
 * Usage:
 *   import { env } from '@/lib/env';
 *   const dbUrl = env.DATABASE_URL;
 */

import { z } from 'zod';

/**
 * Server-side environment variables schema
 * Simplified for local automation tool
 */
const serverEnvSchema = z.object({
  // Node environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Server Configuration
  PORT: z
    .string()
    .regex(/^\d+$/, 'PORT must be a number')
    .transform((val) => parseInt(val, 10))
    .default('3000'),
});

/**
 * Validates server-side environment variables
 * Throws an error at startup if validation fails
 */
function validateServerEnv() {
  try {
    return serverEnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => {
        const path = err.path.join('.');
        return `  - ${path}: ${err.message}`;
      });

      throw new Error(
        `❌ Invalid environment variables:\n${missingVars.join('\n')}\n\n` +
          'Please check your .env file and ensure all required variables are set.',
      );
    }
    throw error;
  }
}

/**
 * Validated server-side environment variables
 * Use this in server-side code (API routes, server components, etc.)
 */
export const env = validateServerEnv();

/**
 * Type exports for TypeScript inference
 */
export type Env = typeof env;
