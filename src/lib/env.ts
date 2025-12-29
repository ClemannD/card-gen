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
 * These are only available on the server
 */
const serverEnvSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Better Auth Configuration
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, 'BETTER_AUTH_SECRET must be at least 32 characters')
    .describe('Secret key for Better Auth. Generate with: openssl rand -base64 32'),

  BETTER_AUTH_URL: z
    .string()
    .url('BETTER_AUTH_URL must be a valid URL')
    .optional()
    .describe('Base URL for Better Auth (required in production)'),

  // Server Configuration
  PORT: z
    .string()
    .regex(/^\d+$/, 'PORT must be a number')
    .transform((val) => parseInt(val, 10))
    .default('3000'),

  // Vercel-specific (optional)
  VERCEL_URL: z.string().url().optional(),
});

/**
 * Client-side environment variables schema
 * These are prefixed with NEXT_PUBLIC_ and available in the browser
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url().optional(),
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
          'Please check your .env file and ensure all required variables are set.\n' +
          'See .env.example for reference.',
      );
    }
    throw error;
  }
}

/**
 * Validates client-side environment variables
 * Returns validated client env or empty object if validation fails
 * (Client-side validation is less strict to avoid breaking the app)
 */
function validateClientEnv() {
  try {
    return clientEnvSchema.parse(process.env);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Some client-side environment variables may be invalid:', error);
    }
    return {};
  }
}

/**
 * Validated server-side environment variables
 * Use this in server-side code (API routes, server components, etc.)
 */
export const env = validateServerEnv();

/**
 * Validated client-side environment variables
 * Use this in client-side code (components marked with 'use client')
 */
export const clientEnv = validateClientEnv();

/**
 * Type exports for TypeScript inference
 */
export type Env = typeof env;
export type ClientEnv = typeof clientEnv;

