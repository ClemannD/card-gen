'use client';

import { useState, use, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ModeToggle } from '@/components/mode-toggle';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Play,
  Settings,
  History,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Pencil,
  Save,
  X,
} from 'lucide-react';

export default function ConfigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const utils = api.useUtils();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [settings, setSettings] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const { data: config, isLoading } = api.config.get.useQuery({ id });

  // Initialize form state when config loads
  useEffect(() => {
    if (config && !initialized && !isEditing) {
      setName(config.name);
      try {
        setSettings(JSON.stringify(JSON.parse(config.settings), null, 2));
      } catch {
        setSettings(config.settings);
      }
      setInitialized(true);
    }
  }, [config, initialized, isEditing]);

  const updateConfig = api.config.update.useMutation({
    onSuccess: () => {
      utils.config.get.invalidate({ id });
      setIsEditing(false);
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const runScript = api.automation.run.useMutation({
    onSuccess: (run) => {
      router.push(`/runs/${run.id}`);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSave = () => {
    setError(null);

    let parsedSettings = {};
    try {
      parsedSettings = JSON.parse(settings);
    } catch {
      setError('Settings must be valid JSON');
      return;
    }

    updateConfig.mutate({
      id,
      name,
      settings: parsedSettings,
    });
  };

  const handleCancel = () => {
    if (config) {
      setName(config.name);
      try {
        setSettings(JSON.stringify(JSON.parse(config.settings), null, 2));
      } catch {
        setSettings(config.settings);
      }
    }
    setIsEditing(false);
    setError(null);
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
        <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <Skeleton className="h-8 w-64 bg-zinc-800" />
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-64 w-full bg-zinc-800 mb-6" />
          <Skeleton className="h-48 w-full bg-zinc-800" />
        </main>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="py-8 text-center">
            <p className="text-zinc-400">Configuration not found</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/configs">Back to Configs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="icon">
                <Link href="/configs">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Play className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-zinc-100">{config.name}</h1>
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

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Config Details */}
        <Card className="bg-zinc-900/50 border-zinc-800 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-zinc-100">Configuration Details</CardTitle>
                <CardDescription className="text-zinc-400">
                  View and edit your automation settings
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={updateConfig.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateConfig.isPending ? 'Saving...' : 'Save'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      onClick={() => runScript.mutate({ configId: id })}
                      disabled={runScript.isPending}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {runScript.isPending ? 'Running...' : 'Run Now'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-200">Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                />
              ) : (
                <p className="text-zinc-100 bg-zinc-800 p-3 rounded-md">{config.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings" className="text-zinc-200">Settings (JSON)</Label>
              {isEditing ? (
                <Textarea
                  id="settings"
                  value={settings}
                  onChange={(e) => setSettings(e.target.value)}
                  rows={12}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 font-mono text-sm"
                />
              ) : (
                <pre className="text-zinc-100 bg-zinc-800 p-3 rounded-md overflow-x-auto font-mono text-sm">
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(config.settings), null, 2);
                    } catch {
                      return config.settings;
                    }
                  })()}
                </pre>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Runs */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Recent Runs</CardTitle>
            <CardDescription className="text-zinc-400">
              Last 10 executions of this configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            {config.runs.length > 0 ? (
              <div className="space-y-3">
                {config.runs.map((run) => (
                  <Link
                    key={run.id}
                    href={`/runs/${run.id}`}
                    className="block p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors border border-zinc-700/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(run.status)}
                        <div>
                          <p className="text-sm text-zinc-100">{formatDate(run.startedAt)}</p>
                          {run.error && (
                            <p className="text-xs text-red-400 truncate max-w-md">{run.error}</p>
                          )}
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
                  Click &quot;Run Now&quot; to execute this automation
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

