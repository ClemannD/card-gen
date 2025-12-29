# Server Architecture

This directory contains the server-side code for the application, including tRPC setup, authentication, and API routes.

## Directory Structure

```
src/server/
├── auth/              # Authentication logic
│   ├── auth-context.ts   # Creates auth context from better-auth
│   └── auth-utils.ts     # Auth validation helpers
├── routes/            # API route handlers (tRPC routers)
│   ├── account/          # User account operations
│   └── notes/            # Notes CRUD operations
└── trpc/              # tRPC configuration
    ├── trpc.ts           # tRPC instance and procedure definitions
    └── root.ts           # Main app router
```

## Authentication

This application uses [better-auth](https://better-auth.com) for authentication.

### How Authentication Works

1. **User Authentication**: Users sign in via better-auth (email/password)
2. **Session Management**: Sessions are managed through cookies and validated server-side
3. **Context Creation**: Each tRPC request calls `createAuthContext()` to fetch the current user
4. **Procedure Protection**: Different procedure types enforce different auth requirements

### Auth Context (`auth/auth-context.ts`)

The `createAuthContext()` function:
- Retrieves the current user session from better-auth
- Returns `{ user, session }` for use in tRPC procedures
- Called automatically for every tRPC request

### Auth Utilities (`auth/auth-utils.ts`)

Helper functions for validating auth state:

- **`requireAuth(user)`** - Throws UNAUTHORIZED if no user (use in protected procedures)
- **`isAuthenticated(user)`** - Boolean check for authenticated user
- **`getUserDisplayName(user)`** - Get user's display name

## tRPC Setup

### Procedure Types (`trpc/trpc.ts`)

Two procedure types are available:

#### 1. `publicProcedure`

No authentication required. Use for public endpoints.

```typescript
export const myPublicProcedure = publicProcedure
  .query(async ({ ctx }) => {
    // ctx.user and ctx.session may be null
    return { message: "Hello World" };
  });
```

#### 2. `protectedProcedure`

Requires authenticated user. Automatically validates `ctx.user` is not null.

```typescript
export const myProtectedProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    // ctx.user is guaranteed to be non-null
    return { userId: ctx.user.id };
  });
```

### Error Handling

tRPC procedures use specific error codes that map to HTTP status codes:

- `UNAUTHORIZED` (401) - Not logged in
- `FORBIDDEN` (403) - Not allowed to access resource
- `NOT_FOUND` (404) - Resource doesn't exist
- `BAD_REQUEST` (400) - Invalid input

Example:

```typescript
import { TRPCError } from "@trpc/server";

throw new TRPCError({
  code: "NOT_FOUND",
  message: "Resource not found",
});
```

## Usage Examples

### Creating a Query

```typescript
// In a procedure file
export const getItemProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    const item = await prisma.item.findUnique({
      where: { id: input.id },
    });
    return item;
  });
```

### Creating a Mutation

```typescript
// In a procedure file
export const createItemProcedure = protectedProcedure
  .input(z.object({
    name: z.string(),
    description: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    const item = await prisma.item.create({
      data: {
        id: createId(),
        name: input.name,
        description: input.description,
        userId: ctx.user.id,
      },
    });
    return item;
  });
```

### Client-Side Usage

```typescript
"use client";
import { api } from "@/trpc/react";

export function MyComponent() {
  // Query
  const { data, isLoading } = api.notes.list.useQuery();

  // Mutation
  const utils = api.useUtils();
  const createNote = api.notes.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch
      utils.notes.list.invalidate();
    },
  });

  return (
    <button onClick={() => createNote.mutate({ title: "New", content: "Note" })}>
      Create Note
    </button>
  );
}
```

### Server Component Usage

```typescript
import { api } from "@/trpc/server";

export default async function Page() {
  const notes = await api.notes.list();
  return <div>{notes.map(note => ...)}</div>;
}
```

## Database Access

- Prisma is used for database access
- Import `prisma` from `@/server/prisma`
- Currently configured for SQLite (see `prisma/schema.prisma`)

To switch databases:
1. Update `datasource db` in `prisma/schema.prisma`
2. Update `DATABASE_URL` in `.env`
3. Run `npm run prisma-generate && npm run prisma-push`

## Adding New Routes

See [routes/README.md](./routes/README.md) for detailed instructions on adding new API routes.
