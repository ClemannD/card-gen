/**
 * Client-Side Environment Variables
 * ==================================
 * Safe access to client-side environment variables.
 * 
 * Note: Only NEXT_PUBLIC_ prefixed variables are available in the browser.
 * Server-side variables are not accessible in client components.
 * 
 * Usage:
 *   import { getClientEnv } from '@/lib/env.client';
 *   const baseUrl = getClientEnv('NEXT_PUBLIC_BETTER_AUTH_URL');
 */

/**
 * Safely get a client-side environment variable
 * Returns undefined if not set (client-side validation is lenient)
 */
export function getClientEnv(key: string): string | undefined {
  if (typeof window === 'undefined') {
    // Server-side: can access all env vars
    return process.env[key];
  }
  // Client-side: only NEXT_PUBLIC_ vars are available
  return process.env[key];
}

/**
 * Get base URL for client-side requests
 * Handles both server-side rendering and client-side execution
 */
export function getBaseUrl(): string {
  // In the browser, use current origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server-side: check VERCEL_URL first, then NEXT_PUBLIC_BETTER_AUTH_URL, then default
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL) {
    return process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  }

  // Default fallback
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  return `http://localhost:${port}`;
}

/**
 * Check if we're in development mode
 * Safe to use in both client and server code
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

