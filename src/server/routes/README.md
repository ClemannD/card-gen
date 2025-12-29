# Server Routes

This directory contains all tRPC routers and their procedures.

## Structure

```
routes/
├── cards/               # Card management
│   ├── cards.router.ts
│   └── procedures/
│       ├── create-cards.procedure.ts
│       ├── list-cards.procedure.ts
│       └── delete-card.procedure.ts
├── settings/            # Settings management
│   ├── settings.router.ts
│   └── procedures/
│       ├── get-settings.procedure.ts
│       ├── update-settings.procedure.ts
│       └── list-cardholders.procedure.ts
```

## Adding New Routes

1. Create a new folder for your feature (e.g., `routes/myfeature/`)
2. Create the router file (e.g., `myfeature.router.ts`)
3. Create procedures in a `procedures/` subfolder
4. Register the router in `src/server/trpc/root.ts`

## Procedure Conventions

- Use `publicProcedure` for all procedures (no auth in this local tool)
- Input validation with Zod schemas
- Return Prisma queries directly or throw `TRPCError` for errors
