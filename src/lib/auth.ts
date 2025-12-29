/**
 * Better Auth Configuration
 * =========================
 * This file configures the authentication system for the application.
 *
 * To switch authentication providers:
 * 1. Import different plugins from 'better-auth/plugins'
 * 2. Configure the plugin in the plugins array
 * 3. Update the database schema if needed
 *
 * To switch databases:
 * 1. Update prisma/schema.prisma datasource
 * 2. Change the provider in prismaAdapter() below
 * 3. Run: npm run prisma-generate && npm run prisma-push
 */

import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/server/prisma';
import { env } from '@/lib/env';

export const auth = betterAuth({
  // Database adapter configuration
  // Currently using Prisma with SQLite
  // Supported providers: sqlite, postgresql, mysql, mongodb
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),

  // Email and password authentication
  // This is the default authentication method
  emailAndPassword: {
    enabled: true,
    // Set to true in production to require email verification
    requireEmailVerification: false,
  },

  // Session configuration
  session: {
    // How long a session lasts (7 days)
    expiresIn: 60 * 60 * 24 * 7,
    // How often to update the session expiry (1 day)
    updateAge: 60 * 60 * 24,
  },

  // Trusted origins for CORS
  // In development, allow requests from common localhost ports
  // In production, set BETTER_AUTH_URL environment variable
  trustedOrigins:
    env.NODE_ENV === 'production'
      ? [env.BETTER_AUTH_URL || ''].filter(Boolean)
      : [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:3002',
          'http://localhost:3003',
        ],

  // Additional plugins can be added here
  // Example: two-factor auth, OAuth providers, etc.
  // plugins: [],
});

export type Session = typeof auth.$Infer.Session;
