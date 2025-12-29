'use client';

import { useSession } from '@/lib/auth-client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="mx-auto h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const isAuthenticated = !!session?.user;

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center">
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="mb-4 text-6xl font-bold tracking-tight">
          Clemann Next Starter
        </h1>
        <p className="text-muted-foreground mb-8 text-xl">
          A modern Next.js starter with tRPC, Prisma, and Better Auth
        </p>

        <div className="mb-12 flex flex-wrap justify-center gap-4">
          {isAuthenticated ? (
            <Button asChild size="lg">
              <Link href="/notes">Go to Notes</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg">
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Sign In</Link>
              </Button>
            </>
          )}
        </div>

        <div className="mx-auto max-w-3xl text-left">
          <h2 className="mb-6 text-2xl font-bold">Features</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>🔐 Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Better Auth integration with email/password authentication.
                  Easy to switch to OAuth providers.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>🚀 tRPC</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  End-to-end type safety with tRPC. Organized router structure
                  with example CRUD operations.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>💾 Database</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  SQLite with Prisma ORM. Easy to switch to PostgreSQL, MySQL,
                  or other databases.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>📝 Example App</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Complete notes CRUD app demonstrating protected routes and
                  real-world patterns.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-inside list-decimal space-y-2 text-sm">
                <li>Clone this repository</li>
                <li>
                  Run{' '}
                  <code className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-xs">
                    npm install
                  </code>
                </li>
                <li>
                  Update{' '}
                  <code className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-xs">
                    .env
                  </code>{' '}
                  with your configuration
                </li>
                <li>
                  Run{' '}
                  <code className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-xs">
                    npm run dev
                  </code>
                </li>
                <li>
                  Visit{' '}
                  <code className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-xs">
                    http://localhost:3000
                  </code>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
