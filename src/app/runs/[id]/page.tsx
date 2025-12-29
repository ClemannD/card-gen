'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Play,
  Settings,
  History,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Terminal,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from 'lucide-react';

export default function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [isRerunDialogOpen, setIsRerunDialogOpen] = useState(false);
  const { data: run, isLoading } = api.automation.getRun.useQuery({ id });

  const runScriptMutation = api.automation.run.useMutation({
    onSuccess: (newRun) => {
      setIsRerunDialogOpen(false);
      router.push(`/runs/${newRun.id}`);
    },
  });

  const handleRerun = () => {
    if (run?.configId) {
      runScriptMutation.mutate({
        configId: run.configId,
        headless: false,
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-emerald-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'running':
        return <Clock className="h-6 w-6 animate-pulse text-amber-500" />;
      default:
        return <Clock className="h-6 w-6 text-zinc-500" />;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
        <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <Skeleton className="h-8 w-64 bg-zinc-800" />
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="mb-6 h-32 w-full bg-zinc-800" />
          <Skeleton className="h-64 w-full bg-zinc-800" />
        </main>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="py-8 text-center">
            <p className="text-zinc-400">Run not found</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/runs">Back to History</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="icon">
                <Link href="/runs">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <Play className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-zinc-100">
                Run Details
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <AlertDialog
                open={isRerunDialogOpen}
                onOpenChange={setIsRerunDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
                    disabled={runScriptMutation.isPending}
                  >
                    {runScriptMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Rerun
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-zinc-800 bg-zinc-900">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-zinc-100">
                      Rerun Configuration?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-400">
                      This will start a new run using the{' '}
                      <span className="font-medium text-violet-400">
                        {run?.config.name}
                      </span>{' '}
                      configuration. The browser automation will begin
                      immediately.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRerun}
                      disabled={runScriptMutation.isPending}
                      className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
                    >
                      {runScriptMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Start Run
                        </>
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Run Summary */}
        <Card className="mb-6 border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon(run.status)}
                <div>
                  <CardTitle className="text-zinc-100">
                    {run.config.name}
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    {formatDate(run.startedAt)}
                  </CardDescription>
                </div>
              </div>
              <span
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  run.status === 'success'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : run.status === 'error'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-zinc-800/50 p-4">
                <p className="mb-1 text-sm text-zinc-400">Duration</p>
                <p className="text-lg font-medium text-zinc-100">
                  {formatDuration(run.startedAt, run.endedAt)}
                </p>
              </div>
              <div className="rounded-lg bg-zinc-800/50 p-4">
                <p className="mb-1 text-sm text-zinc-400">Configuration</p>
                <Link
                  href={`/configs/${run.configId}`}
                  className="text-lg font-medium text-violet-400 hover:text-violet-300"
                >
                  {run.config.name}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error (if any) */}
        {run.error && (
          <Card className="mb-6 border-red-900/50 bg-red-950/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <CardTitle className="text-red-400">Error</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-lg bg-red-950/50 p-4 font-mono text-sm whitespace-pre-wrap text-red-300">
                {run.error}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Output Log */}
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-zinc-400" />
              <CardTitle className="text-zinc-100">Output Log</CardTitle>
            </div>
            <CardDescription className="text-zinc-400">
              Console output from the automation run
            </CardDescription>
          </CardHeader>
          <CardContent>
            {run.output ? (
              <pre className="max-h-[500px] overflow-x-auto overflow-y-auto rounded-lg bg-zinc-950 p-4 font-mono text-sm whitespace-pre-wrap text-zinc-300">
                {run.output}
              </pre>
            ) : (
              <div className="py-8 text-center">
                <Terminal className="mx-auto mb-3 h-12 w-12 text-zinc-700" />
                <p className="text-zinc-500">No output recorded</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
