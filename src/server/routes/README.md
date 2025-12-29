# Server Routes

This directory contains all tRPC routers and their procedures.

## Structure

```
routes/
├── config/              # Configuration management
│   ├── config.router.ts
│   └── procedures/
│       ├── list-configs.procedure.ts
│       ├── get-config.procedure.ts
│       ├── create-config.procedure.ts
│       ├── update-config.procedure.ts
│       └── delete-config.procedure.ts
└── automation/          # Automation execution
    ├── automation.router.ts
    └── procedures/
        ├── run-script.procedure.ts
        ├── list-runs.procedure.ts
        └── get-run.procedure.ts
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
