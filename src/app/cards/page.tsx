'use client';

import { useState } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  CreditCard,
  Settings,
  Plus,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';

type CardData = {
  id: string;
  airwallexCardId: string;
  nickname: string;
  cardNumber: string;
  cvv: string;
  expiryMonth: number;
  expiryYear: number;
  nameOnCard: string;
  status: string;
  createdAt: Date;
};

function MaskedCell({
  value,
  isSensitive = false,
}: {
  value: string;
  isSensitive?: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayValue = isSensitive && !isVisible ? '••••' : value;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm">{displayValue}</span>
      {isSensitive && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsVisible(!isVisible)}
        >
          {isVisible ? (
            <EyeOff className="h-3 w-3" />
          ) : (
            <Eye className="h-3 w-3" />
          )}
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-3 w-3 text-emerald-500" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}

function CardNumberCell({ value }: { value: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const maskedNumber = value.replace(/(\d{4})/g, '$1 ').trim();
  const hiddenNumber = `•••• •••• •••• ${value.slice(-4)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm">
        {isVisible ? maskedNumber : hiddenNumber}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => setIsVisible(!isVisible)}
      >
        {isVisible ? (
          <EyeOff className="h-3 w-3" />
        ) : (
          <Eye className="h-3 w-3" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-3 w-3 text-emerald-500" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}

export default function CardsPage() {
  const [page, setPage] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const pageSize = 20;

  const { data, isLoading, refetch } = api.cards.list.useQuery({
    page,
    pageSize,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const deleteCardMutation = api.cards.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const columns: ColumnDef<CardData>[] = [
    {
      accessorKey: 'nickname',
      header: 'Card Name',
      cell: ({ row }) => (
        <span className="font-medium text-zinc-100">
          {row.getValue('nickname')}
        </span>
      ),
    },
    {
      accessorKey: 'cardNumber',
      header: 'Card Number',
      cell: ({ row }) => <CardNumberCell value={row.getValue('cardNumber')} />,
    },
    {
      accessorKey: 'cvv',
      header: 'CVV',
      cell: ({ row }) => (
        <MaskedCell value={row.getValue('cvv')} isSensitive />
      ),
    },
    {
      id: 'expiry',
      header: 'Expiry',
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {String(row.original.expiryMonth).padStart(2, '0')}/
          {row.original.expiryYear}
        </span>
      ),
    },
    {
      accessorKey: 'nameOnCard',
      header: 'Name on Card',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              status === 'active'
                ? 'bg-emerald-500/20 text-emerald-400'
                : status === 'frozen'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-red-500/20 text-red-400'
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border-zinc-800 bg-zinc-900">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-zinc-100">
                Delete Card?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                This will remove the card "{row.original.nickname}" from your
                local database. The card will still exist in Airwallex.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteCardMutation.mutate({ id: row.original.id })}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
  ];

  const table = useReactTable({
    data: data?.cards ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const exportToCsv = () => {
    if (!data?.cards) return;

    const headers = [
      'Card Name',
      'Card Number',
      'CVV',
      'Expiry Month',
      'Expiry Year',
      'Name on Card',
      'Status',
      'Created At',
    ];

    const rows = data.cards.map((card) => [
      card.nickname,
      card.cardNumber,
      card.cvv,
      card.expiryMonth,
      card.expiryYear,
      card.nameOnCard,
      card.status,
      new Date(card.createdAt).toISOString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cards-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-zinc-100">Cards</h1>
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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">Virtual Cards</h2>
            <p className="mt-1 text-zinc-400">
              Manage your Airwallex virtual cards
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCsv}
              disabled={!data?.cards?.length}
              className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
            >
              <Link href="/cards/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Cards
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        {data && (
          <div className="mb-6 grid grid-cols-3 gap-4">
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardContent className="py-4">
                <p className="text-sm text-zinc-400">Total Cards</p>
                <p className="text-2xl font-bold text-zinc-100">{data.total}</p>
              </CardContent>
            </Card>
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardContent className="py-4">
                <p className="text-sm text-zinc-400">Active</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {data.cards.filter((c) => c.status === 'active').length}
                </p>
              </CardContent>
            </Card>
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardContent className="py-4">
                <p className="text-sm text-zinc-400">Current Page</p>
                <p className="text-2xl font-bold text-zinc-100">
                  {page + 1} / {data.totalPages || 1}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Table */}
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-zinc-100">All Cards</CardTitle>
            <CardDescription className="text-zinc-400">
              Click on the eye icon to reveal sensitive card details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full bg-zinc-800" />
                ))}
              </div>
            ) : data?.cards && data.cards.length > 0 ? (
              <>
                <div className="rounded-lg border border-zinc-800">
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                          key={headerGroup.id}
                          className="border-zinc-800 hover:bg-zinc-800/50"
                        >
                          {headerGroup.headers.map((header) => (
                            <TableHead
                              key={header.id}
                              className="text-zinc-400"
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          className="border-zinc-800 hover:bg-zinc-800/50"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="text-zinc-300">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-zinc-400">
                    Showing {page * pageSize + 1} to{' '}
                    {Math.min((page + 1) * pageSize, data.total)} of {data.total}{' '}
                    cards
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
                      disabled={page >= (data.totalPages || 1) - 1}
                      className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center">
                <CreditCard className="mx-auto mb-4 h-12 w-12 text-zinc-700" />
                <h3 className="mb-2 text-lg font-medium text-zinc-100">
                  No cards yet
                </h3>
                <p className="mb-4 text-zinc-500">
                  Create your first virtual card to get started
                </p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
                >
                  <Link href="/cards/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Cards
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

