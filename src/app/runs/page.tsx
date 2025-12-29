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
import { Play, Settings, History, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function RunsPage() {
  const { data: runs, isLoading } = api.automation.listRuns.useQuery({ limit: 50 });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Clock className="h-5 w-5 text-amber-500 animate-pulse" />;
      default:
        return <Clock className="h-5 w-5 text-zinc-500" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const formatDuration = (start: Date, end: Date | null) => {
    if (!end) return 'In progress...';
    const ms = new Date(end).getTime() - new Date(start).getTime();
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="icon">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Play className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-zinc-100">Run History</h1>
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-zinc-100">All Runs</h2>
          <p className="text-zinc-400 mt-1">View all automation execution history</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full bg-zinc-800" />
            ))}
          </div>
        ) : runs && runs.length > 0 ? (
          <div className="space-y-4">
            {runs.map((run) => (
              <Link
                key={run.id}
                href={`/runs/${run.id}`}
                className="block"
              >
                <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(run.status)}
                        <div>
                          <p className="font-medium text-zinc-100">{run.config.name}</p>
                          <p className="text-sm text-zinc-500">{formatDate(run.startedAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-zinc-400">
                            {formatDuration(run.startedAt, run.endedAt)}
                          </p>
                          {run.error && (
                            <p className="text-xs text-red-400 truncate max-w-xs">{run.error}</p>
                          )}
                        </div>
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${
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
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="py-12 text-center">
              <History className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-zinc-100 mb-2">No runs yet</h3>
              <p className="text-zinc-500 mb-4">
                Create a configuration and run your first automation
              </p>
              <Button asChild variant="outline">
                <Link href="/configs">Go to Configs</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

