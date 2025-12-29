# Clemann Next.js tRPC Starter

A production-ready Next.js 15 starter template with tRPC, Prisma, and Better Auth. Features a clean architecture, type safety, and a complete example application.

## Features

- ⚡ **Next.js 15** - Latest version with App Router
- 🔐 **Better Auth** - Modern authentication with email/password (easy to add OAuth)
- 🚀 **tRPC** - End-to-end type safety for your API
- 💾 **Prisma** - Type-safe database ORM with SQLite (easy to switch databases)
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 📝 **Example App** - Complete notes CRUD demonstrating best practices
- 🏗️ **Clean Architecture** - Organized folder structure with clear separation of concerns

## Quick Start

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd clemann-next-trpc-starter
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory (you can copy from `.env.example`):

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
DATABASE_URL="file:./dev.db"

# Better Auth Configuration
# Generate a secure secret with: openssl rand -base64 32
BETTER_AUTH_SECRET="your-secret-key-here-replace-in-production"
BETTER_AUTH_URL="http://localhost:3000"
```

**Important:** The application validates all required environment variables at startup. If any are missing or invalid, you'll see a clear error message with details about what needs to be fixed.

**Environment Variable Validation:**
- All required variables are validated using Zod schemas
- Missing or invalid variables will prevent the app from starting
- See `.env.example` for all available configuration options

### 4. Initialize the database

```bash
npm run prisma-generate
npm run prisma-push
```

### 5. Start the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── notes/             # Example notes CRUD app
│   └── api/               # API routes
│       ├── auth/          # Better Auth API handler
│       └── trpc/          # tRPC API handler
├── lib/                   # Shared utilities
│   ├── auth.ts           # Better Auth server configuration
│   ├── auth-client.ts    # Better Auth client hooks
│   └── utils.ts          # General utilities
├── server/                # Server-side code
│   ├── auth/             # Auth context and utilities
│   ├── routes/           # tRPC routers organized by domain
│   │   ├── account/      # User account operations
│   │   └── notes/        # Notes CRUD operations
│   ├── trpc/             # tRPC setup
│   │   ├── trpc.ts       # tRPC instance & procedures
│   │   └── root.ts       # Main app router
│   └── prisma.ts         # Prisma client singleton
└── trpc/                  # Client-side tRPC
    ├── query-client.ts   # Shared Query Client
    ├── react.tsx         # React hooks
    └── server.ts         # Server Components caller
```

## Documentation

- **[Server Architecture](./src/server/README.md)** - Learn about the server setup, tRPC, and authentication
- **[API Routes](./src/server/routes/README.md)** - Guide to creating new API routes

## Switching Authentication Providers

The starter uses Better Auth with email/password authentication. To add OAuth providers:

1. Install the provider plugin (if needed)
2. Update `src/lib/auth.ts` with the provider configuration
3. See [Better Auth docs](https://better-auth.com) for details

Example for GitHub OAuth:

```typescript
// src/lib/auth.ts
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});
```

## Switching Databases

The starter uses SQLite for simplicity. To switch to PostgreSQL, MySQL, or another database:

1. Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // or mysql, mongodb, etc.
  url      = env("DATABASE_URL")
}
```

2. Update `DATABASE_URL` in `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

3. Update the database adapter in `src/lib/auth.ts`:

```typescript
database: prismaAdapter(prisma, {
  provider: "postgresql",  // match your database
}),
```

4. Generate and push the schema:

```bash
npm run prisma-generate
npm run prisma-push
```

## Building for Production

```bash
npm run build
npm run start
```

## Example Application

The starter includes a complete notes CRUD application demonstrating:

- ✅ Protected routes with authentication
- ✅ tRPC queries and mutations
- ✅ Optimistic updates with cache invalidation
- ✅ Form handling and validation
- ✅ Error handling
- ✅ User session management

Visit `/notes` after signing up to see it in action!

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **API**: tRPC 11
- **Database**: Prisma with SQLite (configurable)
- **Auth**: Better Auth
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (via tRPC)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma-generate` - Generate Prisma client
- `npm run prisma-push` - Push schema to database

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT
