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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModeToggle } from '@/components/mode-toggle';
import {
  CreditCard,
  Settings,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export default function CreateCardsPage() {
  const router = useRouter();
  const [count, setCount] = useState(1);
  const [useRandomNames, setUseRandomNames] = useState(true);
  const [nicknamePrefix, setNicknamePrefix] = useState('');
  const [transactionLimit, setTransactionLimit] = useState(15000);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    status: 'idle' | 'creating' | 'success' | 'error';
    message?: string;
  }>({ current: 0, total: 0, status: 'idle' });

  const createCardsMutation = api.cards.create.useMutation({
    onSuccess: (data) => {
      setProgress({
        current: data.created,
        total: data.created,
        status: 'success',
        message: `Successfully created ${data.created} card${data.created > 1 ? 's' : ''}!`,
      });
      setTimeout(() => {
        router.push('/cards');
      }, 2000);
    },
    onError: (error) => {
      setProgress((prev) => ({
        ...prev,
        status: 'error',
        message: error.message,
      }));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProgress({
      current: 0,
      total: count,
      status: 'creating',
      message: 'Creating cards...',
    });
    createCardsMutation.mutate({
      count,
      nicknamePrefix: useRandomNames ? undefined : nicknamePrefix || undefined,
      transactionLimit,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="icon">
                <Link href="/cards">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-zinc-100">
                Create Cards
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-2">
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

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-zinc-100">
              Create Virtual Cards
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Create multiple virtual cards via Airwallex API. Cards will be
              created with your default cardholder.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Number of Cards */}
              <div className="space-y-2">
                <Label htmlFor="count" className="text-zinc-200">
                  Number of Cards
                </Label>
                <Input
                  id="count"
                  type="number"
                  min={1}
                  max={100}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  disabled={progress.status === 'creating'}
                  className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500"
                />
                <p className="text-xs text-zinc-500">
                  Enter a number between 1 and 100
                </p>
              </div>

              {/* Random Names Checkbox */}
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="useRandomNames"
                  checked={useRandomNames}
                  onCheckedChange={(checked) => {
                    setUseRandomNames(checked === true);
                    if (checked) {
                      setNicknamePrefix('');
                    }
                  }}
                  disabled={progress.status === 'creating'}
                  className="border-zinc-600 data-[state=checked]:border-violet-500 data-[state=checked]:bg-violet-500"
                />
                <Label
                  htmlFor="useRandomNames"
                  className="cursor-pointer text-zinc-200"
                >
                  Use random names
                </Label>
              </div>

              {/* Nickname Prefix */}
              <div className="space-y-2">
                <Label
                  htmlFor="nicknamePrefix"
                  className={`text-zinc-200 ${useRandomNames ? 'opacity-50' : ''}`}
                >
                  Nickname Prefix
                </Label>
                <Input
                  id="nicknamePrefix"
                  type="text"
                  placeholder="e.g., Campaign Card"
                  value={nicknamePrefix}
                  onChange={(e) => setNicknamePrefix(e.target.value)}
                  disabled={progress.status === 'creating' || useRandomNames}
                  className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-xs text-zinc-500">
                  {useRandomNames
                    ? 'Cards will be named with random first and last names (e.g., "John Smith")'
                    : `Cards will be named "${nicknamePrefix || 'Prefix'} 1", "${nicknamePrefix || 'Prefix'} 2", etc.`}
                </p>
              </div>

              {/* Transaction Limit */}
              <div className="space-y-2">
                <Label htmlFor="transactionLimit" className="text-zinc-200">
                  Transaction Limit (CAD)
                </Label>
                <Input
                  id="transactionLimit"
                  type="number"
                  min={1}
                  value={transactionLimit}
                  onChange={(e) => setTransactionLimit(parseInt(e.target.value) || 15000)}
                  disabled={progress.status === 'creating'}
                  className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500"
                />
                <p className="text-xs text-zinc-500">
                  Maximum amount per transaction in CAD. Default is $15,000.
                </p>
              </div>

              {/* Progress */}
              {progress.status !== 'idle' && (
                <div
                  className={`rounded-lg p-4 ${
                    progress.status === 'creating'
                      ? 'bg-violet-500/10 border border-violet-500/20'
                      : progress.status === 'success'
                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                        : 'bg-red-500/10 border border-red-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {progress.status === 'creating' && (
                      <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
                    )}
                    {progress.status === 'success' && (
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    )}
                    {progress.status === 'error' && (
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    )}
                    <div>
                      <p
                        className={`font-medium ${
                          progress.status === 'creating'
                            ? 'text-violet-300'
                            : progress.status === 'success'
                              ? 'text-emerald-300'
                              : 'text-red-300'
                        }`}
                      >
                        {progress.message}
                      </p>
                      {progress.status === 'creating' && (
                        <p className="text-sm text-zinc-400">
                          This may take a moment...
                        </p>
                      )}
                    </div>
                  </div>
                  {progress.status === 'creating' && (
                    <div className="mt-3">
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full animate-pulse bg-gradient-to-r from-violet-500 to-fuchsia-500"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  disabled={progress.status === 'creating'}
                  className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
                >
                  <Link href="/cards">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={
                    progress.status === 'creating' ||
                    progress.status === 'success'
                  }
                  className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
                >
                  {progress.status === 'creating' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Create {count} Card{count > 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-zinc-100">How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-400">
            <p>
              <span className="font-medium text-zinc-300">1.</span> Cards are
              created using your Airwallex API credentials
            </p>
            <p>
              <span className="font-medium text-zinc-300">2.</span> Each card is
              a virtual card linked to your default cardholder
            </p>
            <p>
              <span className="font-medium text-zinc-300">3.</span> Card details
              (number, CVV, expiry) are retrieved and stored locally
            </p>
            <p>
              <span className="font-medium text-zinc-300">4.</span> You can
              export all card details to CSV from the cards list page
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

