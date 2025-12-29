'use client';

import { useState } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Settings,
  CreditCard,
  History,
  ArrowLeft,
  Copy,
  Check,
  User,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={handleCopy}
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}

function UseButton({
  cardholderId,
  onSelect,
}: {
  cardholderId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300"
      onClick={() => onSelect(cardholderId)}
    >
      Use This
    </Button>
  );
}

export default function CardholdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = api.settings.listCardholders.useQuery({
    page,
    pageSize,
  });

  const updateSettingsMutation = api.settings.update.useMutation({
    onSuccess: () => {
      router.push('/settings');
    },
  });

  const handleSelectCardholder = (cardholderId: string) => {
    updateSettingsMutation.mutate({
      airwallexCardholderId: cardholderId,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="icon">
                <Link href="/settings">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <User className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-zinc-100">
                Cardholders
              </h1>
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
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </Button>
              </nav>
              <ModeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-zinc-100">
                  Airwallex Cardholders
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Select a cardholder to use for creating virtual cards
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isRefetching}
                className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full bg-zinc-800" />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center">
                <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-red-400" />
                <p className="font-medium text-red-300">
                  Failed to load cardholders
                </p>
                <p className="mt-1 text-sm text-red-400/80">{error.message}</p>
                <p className="mt-3 text-sm text-zinc-400">
                  Make sure your API credentials are configured correctly in{' '}
                  <Link
                    href="/settings"
                    className="text-violet-400 underline hover:text-violet-300"
                  >
                    Settings
                  </Link>
                </p>
              </div>
            ) : data?.cardholders && data.cardholders.length > 0 ? (
              <>
                <div className="rounded-lg border border-zinc-800">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                        <TableHead className="text-zinc-400">
                          Cardholder ID
                        </TableHead>
                        <TableHead className="text-zinc-400">Name</TableHead>
                        <TableHead className="text-zinc-400">Email</TableHead>
                        <TableHead className="text-zinc-400">Status</TableHead>
                        <TableHead className="text-zinc-400">Created</TableHead>
                        <TableHead className="text-right text-zinc-400">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.cardholders.map((ch) => (
                        <TableRow
                          key={ch.id}
                          className="border-zinc-800 hover:bg-zinc-800/50"
                        >
                          <TableCell className="font-mono text-sm text-zinc-300">
                            <div className="flex items-center gap-1">
                              <span className="max-w-[200px] truncate">
                                {ch.id}
                              </span>
                              <CopyButton value={ch.id} />
                            </div>
                          </TableCell>
                          <TableCell className="text-zinc-300">
                            {ch.firstName} {ch.lastName}
                          </TableCell>
                          <TableCell className="text-zinc-400">
                            {ch.email || '-'}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${
                                ch.status === 'ACTIVE'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : ch.status === 'INACTIVE'
                                    ? 'bg-zinc-500/20 text-zinc-400'
                                    : 'bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              {ch.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-zinc-400">
                            {formatDate(ch.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <UseButton
                              cardholderId={ch.id}
                              onSelect={handleSelectCardholder}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {data.hasMore && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-zinc-400">
                      Page {page + 1}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!data.hasMore}
                        className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {updateSettingsMutation.isPending && (
                  <div className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/10 p-4 text-center">
                    <p className="text-violet-300">
                      Updating cardholder setting...
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center">
                <User className="mx-auto mb-4 h-12 w-12 text-zinc-700" />
                <h3 className="mb-2 text-lg font-medium text-zinc-100">
                  No cardholders found
                </h3>
                <p className="text-zinc-500">
                  Create a cardholder in your Airwallex dashboard first
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="mt-6 border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-zinc-100">
              What is a Cardholder?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-400">
            <p>
              A cardholder represents a person or entity that can hold virtual
              cards. When you create a virtual card, it must be associated with
              a cardholder.
            </p>
            <p className="mt-3">
              If you don't see any cardholders, you need to create one first in
              your{' '}
              <a
                href="https://www.airwallex.com/app/issuing/cardholders"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 underline hover:text-violet-300"
              >
                Airwallex Dashboard
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

