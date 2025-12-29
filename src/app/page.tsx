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
import { Play, Settings, History, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const { data: configs, isLoading: configsLoading } = api.config.list.useQuery();
  const { data: runs, isLoading: runsLoading } = api.automation.listRuns.useQuery({ limit: 5 });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-amber-500 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-zinc-500" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Play className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-zinc-100">Playwright Automation</h1>
            </div>
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/configs" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Configs
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/runs" className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    History
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
              <CardDescription className="text-zinc-400">Total Configs</CardDescription>
            </CardHeader>
            <CardContent>
              {configsLoading ? (
                <Skeleton className="h-8 w-16 bg-zinc-800" />
              ) : (
                <p className="text-3xl font-bold text-zinc-100">{configs?.length ?? 0}</p>
              )}
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-400">Recent Runs</CardDescription>
            </CardHeader>
            <CardContent>
              {runsLoading ? (
                <Skeleton className="h-8 w-16 bg-zinc-800" />
              ) : (
                <p className="text-3xl font-bold text-zinc-100">{runs?.length ?? 0}</p>
              )}
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-400">Success Rate</CardDescription>
            </CardHeader>
            <CardContent>
              {runsLoading ? (
                <Skeleton className="h-8 w-16 bg-zinc-800" />
              ) : (
                <p className="text-3xl font-bold text-zinc-100">
                  {runs && runs.length > 0
                    ? Math.round(
                        (runs.filter((r) => r.status === 'success').length / runs.length) * 100
                      )
                    : 0}
                  %
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Configurations */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-zinc-100">Configurations</CardTitle>
                <Button asChild size="sm" className="bg-violet-600 hover:bg-violet-700">
                  <Link href="/configs/new" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    New
                  </Link>
                </Button>
              </div>
              <CardDescription className="text-zinc-400">
                Manage your automation configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {configsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full bg-zinc-800" />
                  ))}
                </div>
              ) : configs && configs.length > 0 ? (
                <div className="space-y-3">
                  {configs.slice(0, 5).map((config) => (
                    <Link
                      key={config.id}
                      href={`/configs/${config.id}`}
                      className="block p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors border border-zinc-700/50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-zinc-100">{config.name}</p>
                          <p className="text-sm text-zinc-500">
                            {config._count.runs} runs
                          </p>
                        </div>
                        <Settings className="h-4 w-4 text-zinc-500" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500">No configurations yet</p>
                  <Button asChild size="sm" variant="outline" className="mt-4">
                    <Link href="/configs/new">Create your first config</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Runs */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-zinc-100">Recent Runs</CardTitle>
                <Button asChild size="sm" variant="outline">
                  <Link href="/runs" className="flex items-center gap-2">
                    View All
                  </Link>
                </Button>
              </div>
              <CardDescription className="text-zinc-400">
                Latest automation executions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {runsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full bg-zinc-800" />
                  ))}
                </div>
              ) : runs && runs.length > 0 ? (
                <div className="space-y-3">
                  {runs.map((run) => (
                    <Link
                      key={run.id}
                      href={`/runs/${run.id}`}
                      className="block p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors border border-zinc-700/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(run.status)}
                          <div>
                            <p className="font-medium text-zinc-100">{run.config.name}</p>
                            <p className="text-sm text-zinc-500">
                              {formatDate(run.startedAt)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            run.status === 'success'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : run.status === 'error'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {run.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500">No runs yet</p>
                  <p className="text-sm text-zinc-600 mt-1">
                    Create a config and run your first automation
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
