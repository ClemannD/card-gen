'use client';

import Link from 'next/link';
import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ModeToggle } from '@/components/mode-toggle';
import { Plus, CreditCard, Cog } from 'lucide-react';

export default function Dashboard() {
  const { data: cardsData, isLoading: cardsLoading } = api.cards.list.useQuery({ pageSize: 5 });


  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-zinc-100">Card Generator</h1>
            </div>
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/cards" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Cards
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/settings" className="flex items-center gap-2">
                    <Cog className="h-4 w-4" />
                    Settings
                  </Link>
                </Button>
              </nav>
              <ModeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-400">Total Cards</CardDescription>
            </CardHeader>
            <CardContent>
              {cardsLoading ? (
                <Skeleton className="h-8 w-16 bg-zinc-800" />
              ) : (
                <p className="text-3xl font-bold text-violet-400">{cardsData?.total ?? 0}</p>
              )}
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-400">Active Cards</CardDescription>
            </CardHeader>
            <CardContent>
              {cardsLoading ? (
                <Skeleton className="h-8 w-16 bg-zinc-800" />
              ) : (
                <p className="text-3xl font-bold text-emerald-400">
                  {cardsData?.cards.filter(c => c.status === 'active').length ?? 0}
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-400">Frozen Cards</CardDescription>
            </CardHeader>
            <CardContent>
              {cardsLoading ? (
                <Skeleton className="h-8 w-16 bg-zinc-800" />
              ) : (
                <p className="text-3xl font-bold text-amber-400">
                  {cardsData?.cards.filter(c => c.status === 'frozen').length ?? 0}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cards Quick Access */}
        <Card className="bg-zinc-900/50 border-zinc-800 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-zinc-100">
                <CreditCard className="h-5 w-5 text-violet-400" />
                Virtual Cards
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href="/cards">View All</Link>
                </Button>
                <Button asChild size="sm" className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600">
                  <Link href="/cards/new" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Cards
                  </Link>
                </Button>
              </div>
            </div>
            <CardDescription className="text-zinc-400">
              Create and manage Airwallex virtual cards
            </CardDescription>
          </CardHeader>
          <CardContent>
            {cardsLoading ? (
              <Skeleton className="h-16 w-full bg-zinc-800" />
            ) : cardsData && cardsData.total > 0 ? (
              <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <div>
                  <p className="text-2xl font-bold text-zinc-100">{cardsData.total} cards</p>
                  <p className="text-sm text-zinc-500">
                    {cardsData.cards.filter(c => c.status === 'active').length} active
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/cards">Manage Cards</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <CreditCard className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 mb-3">No cards created yet</p>
                <Button asChild size="sm" className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600">
                  <Link href="/cards/new">Create your first cards</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
