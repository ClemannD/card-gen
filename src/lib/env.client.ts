/**
 * Client-Side Environment Utilities
 * ==================================
 * Helper functions for client-side environment access.
 */

/**
 * Get base URL for client-side requests
 * Handles both server-side rendering and client-side execution
 */
export function getBaseUrl(): string {
  // In the browser, use current origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server-side: default to localhost
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
