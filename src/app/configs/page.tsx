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
import { Play, Settings, History, Plus, ArrowLeft, Trash2 } from 'lucide-react';
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

export default function ConfigsPage() {
  const utils = api.useUtils();
  const { data: configs, isLoading } = api.config.list.useQuery();
  
  const deleteConfig = api.config.delete.useMutation({
    onSuccess: () => {
      utils.config.list.invalidate();
    },
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
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
              <h1 className="text-xl font-semibold text-zinc-100">Configurations</h1>
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">All Configurations</h2>
            <p className="text-zinc-400 mt-1">Manage your automation configurations</p>
          </div>
          <Button asChild className="bg-violet-600 hover:bg-violet-700">
            <Link href="/configs/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Config
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-40 w-full bg-zinc-800" />
            ))}
          </div>
        ) : configs && configs.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {configs.map((config) => (
              <Card key={config.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-zinc-100">{config.name}</CardTitle>
                      <CardDescription className="text-zinc-500 mt-1">
                        Created {formatDate(config.createdAt)}
                      </CardDescription>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-zinc-100">Delete Configuration?</AlertDialogTitle>
                          <AlertDialogDescription className="text-zinc-400">
                            This will permanently delete &quot;{config.name}&quot; and all its run history.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteConfig.mutate({ id: config.id })}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">{config._count.runs} runs</span>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/configs/${config.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="py-12 text-center">
              <Settings className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-zinc-100 mb-2">No configurations yet</h3>
              <p className="text-zinc-500 mb-4">Create your first configuration to get started</p>
              <Button asChild className="bg-violet-600 hover:bg-violet-700">
                <Link href="/configs/new" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Config
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

