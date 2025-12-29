'use client';

import { useState, useEffect } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { ModeToggle } from '@/components/mode-toggle';
import {
  Settings,
  CreditCard,
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Key,
  Globe,
  User,
} from 'lucide-react';

export default function SettingsPage() {
  const [clientId, setClientId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [env, setEnv] = useState<'demo' | 'prod'>('demo');
  const [cardholderId, setCardholderId] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const { data: settings, isLoading, refetch } = api.settings.get.useQuery();

  const updateSettingsMutation = api.settings.update.useMutation({
    onSuccess: () => {
      setSaveStatus('success');
      setApiKey(''); // Clear API key field after save
      refetch();
      setTimeout(() => setSaveStatus('idle'), 3000);
    },
    onError: (error) => {
      setSaveStatus('error');
      setErrorMessage(error.message);
    },
  });

  // Initialize form with settings
  useEffect(() => {
    if (settings) {
      setClientId(settings.airwallexClientId);
      setEnv(settings.airwallexEnv as 'demo' | 'prod');
      setCardholderId(settings.airwallexCardholderId);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    setErrorMessage('');

    const updateData: {
      airwallexClientId?: string;
      airwallexApiKey?: string;
      airwallexEnv?: 'demo' | 'prod';
      airwallexCardholderId?: string;
    } = {
      airwallexClientId: clientId,
      airwallexEnv: env,
      airwallexCardholderId: cardholderId,
    };

    // Only update API key if a new one was entered
    if (apiKey) {
      updateData.airwallexApiKey = apiKey;
    }

    updateSettingsMutation.mutate(updateData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <Settings className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-zinc-100">Settings</h1>
            </div>
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/cards" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Cards
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
            <CardTitle className="flex items-center gap-2 text-zinc-100">
              <Key className="h-5 w-5 text-violet-400" />
              Airwallex API Configuration
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Configure your Airwallex API credentials to create virtual cards.
              Get these from your{' '}
              <a
                href="https://www.airwallex.com/app/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 underline"
              >
                Airwallex Dashboard
              </a>
              .
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full bg-zinc-800" />
                <Skeleton className="h-10 w-full bg-zinc-800" />
                <Skeleton className="h-10 w-full bg-zinc-800" />
                <Skeleton className="h-10 w-full bg-zinc-800" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Client ID */}
                <div className="space-y-2">
                  <Label htmlFor="clientId" className="text-zinc-200">
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4 text-zinc-400" />
                      Client ID
                    </span>
                  </Label>
                  <Input
                    id="clientId"
                    type="text"
                    placeholder="Enter your Airwallex Client ID"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>

                {/* API Key */}
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="text-zinc-200">
                    <span className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-zinc-400" />
                      API Key
                    </span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type={showApiKey ? 'text' : 'password'}
                      placeholder={
                        settings?.hasApiKey
                          ? 'Enter new API key to change (current: ' +
                            settings.airwallexApiKey +
                            ')'
                          : 'Enter your Airwallex API Key'
                      }
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="border-zinc-700 bg-zinc-800 pr-10 text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4 text-zinc-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-zinc-400" />
                      )}
                    </Button>
                  </div>
                  {settings?.hasApiKey && (
                    <p className="text-xs text-emerald-400">
                      ✓ API Key is configured
                    </p>
                  )}
                </div>

                {/* Environment */}
                <div className="space-y-2">
                  <Label htmlFor="env" className="text-zinc-200">
                    <span className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-zinc-400" />
                      Environment
                    </span>
                  </Label>
                  <div className="flex gap-4">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="env"
                        value="demo"
                        checked={env === 'demo'}
                        onChange={() => setEnv('demo')}
                        className="h-4 w-4 border-zinc-600 bg-zinc-800 text-violet-500 focus:ring-violet-500"
                      />
                      <span className="text-zinc-300">
                        Demo (Sandbox)
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="env"
                        value="prod"
                        checked={env === 'prod'}
                        onChange={() => setEnv('prod')}
                        className="h-4 w-4 border-zinc-600 bg-zinc-800 text-violet-500 focus:ring-violet-500"
                      />
                      <span className="text-zinc-300">
                        Production
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Use Demo for testing, Production for real cards
                  </p>
                </div>

                {/* Cardholder ID */}
                <div className="space-y-2">
                  <Label htmlFor="cardholderId" className="text-zinc-200">
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-zinc-400" />
                      Cardholder ID
                    </span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="cardholderId"
                      type="text"
                      placeholder="Enter the cardholder ID for card creation"
                      value={cardholderId}
                      onChange={(e) => setCardholderId(e.target.value)}
                      className="border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:ring-violet-500"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      asChild
                      className="shrink-0 border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
                    >
                      <Link href="/settings/cardholders">Browse</Link>
                    </Button>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Click "Browse" to see available cardholders from your Airwallex account
                  </p>
                </div>

                {/* Status Message */}
                {saveStatus !== 'idle' && (
                  <div
                    className={`rounded-lg p-4 ${
                      saveStatus === 'saving'
                        ? 'border border-violet-500/20 bg-violet-500/10'
                        : saveStatus === 'success'
                          ? 'border border-emerald-500/20 bg-emerald-500/10'
                          : 'border border-red-500/20 bg-red-500/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {saveStatus === 'saving' && (
                        <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
                      )}
                      {saveStatus === 'success' && (
                        <CheckCircle className="h-5 w-5 text-emerald-400" />
                      )}
                      {saveStatus === 'error' && (
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      )}
                      <p
                        className={`font-medium ${
                          saveStatus === 'saving'
                            ? 'text-violet-300'
                            : saveStatus === 'success'
                              ? 'text-emerald-300'
                              : 'text-red-300'
                        }`}
                      >
                        {saveStatus === 'saving' && 'Saving settings...'}
                        {saveStatus === 'success' && 'Settings saved successfully!'}
                        {saveStatus === 'error' && (errorMessage || 'Failed to save settings')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={saveStatus === 'saving'}
                  className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="mt-6 border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-zinc-100">
              Where to find these values
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-zinc-400">
            <div>
              <p className="font-medium text-zinc-300">Client ID & API Key</p>
              <p>
                Go to{' '}
                <a
                  href="https://www.airwallex.com/app/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 underline"
                >
                  Airwallex Dashboard → Settings → API
                </a>{' '}
                and create or copy your API credentials.
              </p>
            </div>
            <div>
              <p className="font-medium text-zinc-300">Cardholder ID</p>
              <p>
                Go to{' '}
                <a
                  href="https://www.airwallex.com/app/issuing/cardholders"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 underline"
                >
                  Airwallex Dashboard → Issuing → Cardholders
                </a>
                , select a cardholder, and copy their ID from the URL or details page.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

