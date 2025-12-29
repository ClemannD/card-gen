# API Routes

This directory contains all tRPC routers organized by domain/feature.

## Structure

Each feature area gets its own directory with a router file and a `procedures/` subdirectory:

```
routes/
├── account/
│   ├── account.router.ts
│   └── procedures/
│       └── get-user.procedure.ts
└── notes/
    ├── notes.router.ts
    └── procedures/
        ├── list-notes.procedure.ts
        ├── get-note.procedure.ts
        ├── create-note.procedure.ts
        ├── update-note.procedure.ts
        └── delete-note.procedure.ts
```

## Naming Conventions

- **Router files**: `{domain}.router.ts` (e.g., `notes.router.ts`)
- **Procedure files**: `{action}-{entity}.procedure.ts` (kebab-case)
- **Procedure exports**: `{action}{Entity}Procedure` (camelCase)

### Examples

| File Name | Export Name |
|-----------|-------------|
| `list-notes.procedure.ts` | `listNotesProcedure` |
| `create-note.procedure.ts` | `createNoteProcedure` |
| `get-user.procedure.ts` | `getUserProcedure` |

## Creating a New Router

### 1. Create the Directory Structure

```bash
mkdir -p src/server/routes/my-feature/procedures
```

### 2. Create a Procedure

Create `src/server/routes/my-feature/procedures/list-items.procedure.ts`:

```typescript
import { protectedProcedure } from "@/server/trpc/trpc";
import { prisma } from "@/server/prisma";

export const listItemsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const items = await prisma.item.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: "desc" },
    });
    return items;
  });
```

### 3. Create the Router

Create `src/server/routes/my-feature/my-feature.router.ts`:

```typescript
import { createTRPCRouter } from "@/server/trpc/trpc";
import { listItemsProcedure } from "./procedures/list-items.procedure";

export const myFeatureRouter = createTRPCRouter({
  list: listItemsProcedure,
  // Add more procedures here
});
```

### 4. Add to Root Router

Update `src/server/trpc/root.ts`:

```typescript
import { myFeatureRouter } from "../routes/my-feature/my-feature.router";

export const appRouter = createTRPCRouter({
  notes: notesRouter,
  account: accountRouter,
  myFeature: myFeatureRouter, // Add your router here
});
```

### 5. Use in Frontend

```typescript
"use client";
import { api } from "@/trpc/react";

export function MyComponent() {
  const { data } = api.myFeature.list.useQuery();
  // ...
}
```

## Procedure Patterns

### Query with Input

```typescript
import { z } from "zod";

export const getItemProcedure = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .query(async ({ ctx, input }) => {
    const item = await prisma.item.findFirst({
      where: {
        id: input.id,
        userId: ctx.user.id, // Ensure user owns this item
      },
    });

    if (!item) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Item not found",
      });
    }

    return item;
  });
```

### Mutation with Validation

```typescript
import { createId } from "@paralleldrive/cuid2";

export const createItemProcedure = protectedProcedure
  .input(z.object({
    name: z.string().min(1).max(255),
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

## Best Practices

1. **One procedure per file** - Keeps code organized and easy to find
2. **Validate ownership** - Always check that resources belong to the user
3. **Use specific error codes** - NOT_FOUND, UNAUTHORIZED, BAD_REQUEST, etc.
4. **Type your inputs** - Use Zod schemas for runtime validation
5. **Return consistent data** - Don't expose sensitive fields
6. **Use transactions** - For operations that modify multiple records

## Nested Routers

You can nest routers for better organization:

```typescript
// routes/team/members/members.router.ts
export const membersRouter = createTRPCRouter({
  list: listMembersProcedure,
  add: addMemberProcedure,
});

// routes/team/team.router.ts
import { membersRouter } from "./members/members.router";

export const teamRouter = createTRPCRouter({
  get: getTeamProcedure,
  members: membersRouter, // Nested router
});

// Usage: api.team.members.list.useQuery()
```

## Example: Complete CRUD Router

See the `notes/` directory for a complete example of a CRUD router with:
- List all (query)
- Get one (query with input)
- Create (mutation with validation)
- Update (mutation with ownership check)
- Delete (mutation with ownership check)
