/**
 * Better Auth Client
 * ==================
 * This client is used on the frontend to interact with the auth system.
 * It provides hooks and methods for authentication operations.
 */

import { createAuthClient } from "better-auth/react";
import { getBaseUrl } from "./env.client";

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient;
