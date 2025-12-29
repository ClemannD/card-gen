'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ModeToggle } from '@/components/mode-toggle';
import { Play, Settings, History, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function NewConfigPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [settings, setSettings] = useState('{}');
  const [error, setError] = useState<string | null>(null);

  const createConfig = api.config.create.useMutation({
    onSuccess: (config) => {
      router.push(`/configs/${config.id}`);
    },
    onError: (err) => {
      // Extract user-friendly error message
      if (err.data?.zodError?.fieldErrors) {
        const fieldErrors = err.data.zodError.fieldErrors;
        const messages = Object.entries(fieldErrors)
          .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
          .join('; ');
        setError(messages);
      } else {
        setError(err.message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    // Validate JSON
    let parsedSettings = {};
    try {
      parsedSettings = JSON.parse(settings);
    } catch {
      setError('Settings must be valid JSON');
      return;
    }

    createConfig.mutate({
      name: name.trim(),
      settings: parsedSettings,
    });
  };

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
              <h1 className="text-xl font-semibold text-zinc-100">New Configuration</h1>
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

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Create Configuration</CardTitle>
            <CardDescription className="text-zinc-400">
              Set up a new automation configuration with custom settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-200">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Automation Config"
                  required
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="settings" className="text-zinc-200">Settings (JSON)</Label>
                <Textarea
                  id="settings"
                  value={settings}
                  onChange={(e) => setSettings(e.target.value)}
                  placeholder='{"key": "value"}'
                  rows={10}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 font-mono text-sm placeholder:text-zinc-500"
                />
                <p className="text-xs text-zinc-500">
                  Enter configuration settings as JSON. These will be passed to your automation script.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={createConfig.isPending}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {createConfig.isPending ? 'Creating...' : 'Create Configuration'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/configs')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

